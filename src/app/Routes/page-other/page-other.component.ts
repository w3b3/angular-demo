import { Component, OnInit } from '@angular/core';
import { Calculation } from '../../Shared/types/Calculation';
import { CustomerType, DomeQuantity, FrameFinishing, GlazingType, SkylightModel, TintedGlazing } from '../../Shared/types/CalculatorEnum';

@Component({
  selector: 'app-page-other',
  templateUrl: 'page-other.component.html',
  styleUrls: ['page-other.component.scss'],
})
export class PageOtherComponent implements OnInit {

  isCustom: boolean;

  calculation: Calculation = {
    quote_quantity: 1,
    skylight_model: null,
    customer_type: null,
    glazing_type: null,
    dome_quantity: null,
    frame_finishing: null,
    tinted_glazing: null,
    oc_width: null,
    oc_height: null,
    setup_fee: null,
    oversize_fee: null,
    price: null,
  };

  calculationOptions = {
    CustomerType: [
      'contractor',
      'retail',
      'dealer',
    ],
    SkylightModel: [
      'pvccm',
      'pvcsr',
      'ff',
      'ffsr',
    ],
    GlazingType: [
      'dome',
      'glass',
    ],
    FrameFinishing: [
      'black',
      'mill',
      'brown',
    ],
    DomeQuantity: [
      'single',
      'double',
      'triple',
    ],
  };

  /*CONSTANTS*/
  MEASURE1 = 60; // First upper limit (in inches) for the Setup fee
  MEASURE2 = 96; // Second upper limit (in inches) for the Setup fee
  SETUP_FEE1 = 50;
  SETUP_FEE2 = 100;
  SETUP_FEE3 = 300;
  OVERSIZE_FEE1 = 0.2;
  OVERSIZE_FEE2 = 0.25;
  OVERSIZE_FEE3 = 0.5;
  BASE_COST1 = 0.26;
  BASE_COST2 = 0.22;
  BASE_COST3 = 0.17;
  AREA1 = 1500;
  AREA12 = 3000;
  AREA2 = 3500;
  CUSTOM_MARKUP = 1.3;

  /*INTERFACES*/
  customerType = CustomerType;
  skylightModel = SkylightModel;
  tintedGlazing = TintedGlazing;
  domeQuantity = DomeQuantity;
  frameFinishing = FrameFinishing;
  glazingType = GlazingType;

  constructor() {
  }

  ngOnInit() {
    this.isCustom = Math.random() >= 0.5;
  }

  log(a: any) {
    // snapshot of the store state
    console.clear();
    console.table(a);
  }

  updateCalculation(key: string, value: any) {
    // update the store with the current change
    this.calculation[key] = value;
    // updates the calculated values based on the change
    this.updatePrice();
    this.updateOversizeFee();
    this.updateSetupFee();
    // displays the result for debugging purposes
    this.log(this.calculation);
  }

  // isCustom() {
  /*TODO implement in second phase*/
  // return this.isCustom;
  // return true;
  // }

  calculateArea() {
    return this.calculation.oc_height * this.calculation.oc_width;
  }

  calculateBaseCost(area: number) {
    let baseCost: number;
    if ( area <= this.AREA1 ) {
      baseCost = this.BASE_COST1;
    }
    if ( area > this.AREA1 || area < this.AREA2 ) {
      baseCost = this.BASE_COST2;
    }

    if ( area >= this.AREA2 ) {
      baseCost = this.BASE_COST3;
    }
    return baseCost;
  }

  updatePrice() {
    /*TODO: re-evaluate on every calculation*/
    const custom = this.isCustom
      ? this.CUSTOM_MARKUP
      : 1;

    const area = this.calculateArea();
    const baseCost = this.calculateBaseCost(area);

    this.calculation.price = Math.round(
      (
        this.calculation.quote_quantity
        * custom
        * baseCost
        * area
        * this.selectCustomerType()
        * this.selectSkylightModel()
        * this.selectGlazingType()
        * this.selectNumberDomes()
        * this.selectTintedGlazing()
      ) + this.selectFrameFinishing(),
    );
  }

  selectTintedGlazing() {
    return this.tintedGlazing[this.calculation.tinted_glazing] == null
      ? 0
      : this.tintedGlazing[this.calculation.tinted_glazing];
  }

  selectFrameFinishing() {
    if ( this.frameFinishing[this.calculation.frame_finishing] == null ) {
      return 0;
    } else {
      if ( this.calculation.frame_finishing === 'black' ) {
        return 0.3 * 0.05 * this.calculation.oc_height * this.calculation.oc_width;
      } else {
        return 0;
      }
    }
  }

  selectCustomerType() {
    return this.customerType[this.calculation.customer_type] == null
      ? 0
      : this.customerType[this.calculation.customer_type];
  }

  selectSkylightModel() {
    return this.skylightModel[this.calculation.skylight_model] == null
      ? 0
      : this.skylightModel[this.calculation.skylight_model];
  }

  selectGlazingType() {
    return this.glazingType[this.calculation.glazing_type] == null
      ? 0
      : this.glazingType[this.calculation.glazing_type];
  }

  selectNumberDomes() {
    if ( this.calculation.glazing_type === 'glass' ) {
      return 1;
    } else {
      return this.domeQuantity[this.calculation.dome_quantity] == null
        ? 0
        : this.domeQuantity[this.calculation.dome_quantity];
    }
  }

  updateOversizeFee() {
    if ( this.glazingType[this.calculation.glazing_type] !== 1 ) {
      if ( this.calculateArea() >  this.AREA1 &&  this.calculateArea() < this.AREA12) {
        this.calculation.oversize_fee = Math.round(this.OVERSIZE_FEE1 * this.calculation.price);
      }
      if ( this.calculateArea() >=  this.AREA12 &&  this.calculateArea() < this.AREA2) {
        this.calculation.oversize_fee = Math.round(this.OVERSIZE_FEE2 * this.calculation.price);
      }
      if ( this.calculateArea() >=  this.AREA2) {
        this.calculation.oversize_fee = Math.round(this.OVERSIZE_FEE3 * this.calculation.price);
      }
    } else {
      this.calculation.oversize_fee = 0;
      // return 0;
    }
  }

  updateSetupFee() {
    // Check if it is NOT glass
    if ( this.glazingType[this.calculation.glazing_type] === 1 ) {
      const w1 = this.calculation.oc_width >= this.MEASURE1 && this.calculation.oc_width < this.MEASURE2;
      const h1 = this.calculation.oc_height >= this.MEASURE1 && this.calculation.oc_height < this.MEASURE2;
      const w2 = this.calculation.oc_width >= this.MEASURE2;
      const h2 = this.calculation.oc_height >= this.MEASURE2;

      if ( w2 || h2 ) {
        this.calculation.setup_fee = this.SETUP_FEE3;
        // return this.SETUP_FEE3;
      } else if ( w1 || h1 ) {
        this.calculation.setup_fee = this.SETUP_FEE2;
        // return this.SETUP_FEE2;
      } else {
        this.calculation.setup_fee = this.SETUP_FEE1;
        // return this.SETUP_FEE1;
      }
    } else {
      // It IS glass
      this.calculation.setup_fee = 0;
    }
  }
}
