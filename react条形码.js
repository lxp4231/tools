//封装为一个单独的文件 Barcode.js
import React, { Component } from 'react';
import JsBarcode from 'jsbarcode';

// 条形码
export default class Barcode extends Component {

  static defaultProps = {
    format: 'CODE128',
    renderer: 'svg',
    width: 1.6,
    height: 25,
    displayValue: true,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 6,
    fontSize: 14,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 0,
    marginBottom: 0,
  };

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  };

  componentDidMount() {
    this.update();
  };

  componentDidUpdate() {
    this.update();
  };

  handleBarcode = (r) => {
    this.barcode = r;
  }

  update() {
    const {
      value,
      format,
      width,
      height,
      displayValue,
      textAlign,
      textPosition,
      textMargin,
      fontSize,
      background,
      margin,
      lineColor,
      marginBottom,
    } = this.props;
    JsBarcode(this.barcode, value, {
      format,
      width,
      height,
      displayValue,
      textAlign,
      textPosition,
      textMargin,
      fontSize,
      background,
      margin,
      lineColor,
      marginBottom,
    })
  };

  render() {
    const { renderer } = this.props;
    if (renderer === 'svg') {
      return (
        <svg ref={this.handleBarcode} />
      );
    } else if (renderer === 'canvas') {
      return (
        <canvas ref={this.handleBarcode} />
      );
    } else if (renderer === 'img') {
      return (
        <img ref={this.handleBarcode} alt="" />
      );
    }
  };
}

