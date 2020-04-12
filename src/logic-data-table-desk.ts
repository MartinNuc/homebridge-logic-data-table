import axios from 'axios';
import { Config, TableInfo } from './models';

let service!: any;
let characteristic!: any;

export function LogicDataTableDeskFactory(
  serviceInj: any,
  characteristicInj: any
) {
  service = serviceInj;
  characteristic = characteristicInj;
  return LogicDataTableDesk;
}

export class LogicDataTableDesk {
  sittingHeight: number;
  standingHeight: number;
  tableApiUrl: String;

  constructor(private log: Function, config: Config) {
    this.sittingHeight = +config.sittingHeight;
    this.standingHeight = +config.standingHeight;
    this.tableApiUrl = config.tableApiUrl;
  }

  getServices() {
    const informationService = new service.AccessoryInformation();
    informationService
      .setCharacteristic(characteristic.Manufacturer, 'LogicData')
      .setCharacteristic(characteristic.Model, 'Adjustable table desk')
      .setCharacteristic(characteristic.SerialNumber, '123-456-789');

    const windowService = new service.Window('LogicData Adjustable desk', '');
    windowService
      .getCharacteristic(characteristic.CurrentPosition)
      ?.on('get', (next: Function) => this.getCurrentPosition(next));
    windowService
      .getCharacteristic(characteristic.TargetPosition)
      ?.on('get', (next: Function) => this.getTargetPosition(next))
      .on('set', (targetPosition: number, next: Function) =>
        this.setTargetPosition(targetPosition, next)
      );
    windowService
      .getCharacteristic(characteristic.PositionState)
      ?.on('get', (next: Function) => this.getPositionState(next));

    return [informationService, windowService];
  }

  getCurrentPosition(next: Function) {
    axios
      .get<TableInfo>(`${this.tableApiUrl}/table`)
      .then((response) => this.heightToPercentage(response.data.current_height))
      .then((percentage) => {
        console.log(`Percentage ${percentage}`);
        return percentage;
      })
      .then((percentage) => next(null, percentage))
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }

  getTargetPosition(next: Function) {
    axios
      .get<TableInfo>(`${this.tableApiUrl}/table`)
      .then((response) => this.heightToPercentage(response.data.target_height))
      .then((percentage) => next(null, percentage))
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }

  getPositionState(next: Function) {
    this.log(characteristic.PositionState.STOPPED,
      characteristic.PositionState.DECREASING,
      characteristic.PositionState.INCREASING);
    axios
      .get<TableInfo>(`${this.tableApiUrl}/table`)
      .then((response) => {
        switch (response.data.direction) {
          case "STOPPED":
            return characteristic.PositionState.STOPPED;
          case "DOWN":
            return characteristic.PositionState.DECREASING;
          case "UP":
            return characteristic.PositionState.INCREASING;
        }
      })
      .then((positionState) => next(null, positionState))
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }

  setTargetPosition(percentage: number, next: Function) {
    const targetPosition = this.percentageToHeight(percentage);
    console.log(`Target position ${targetPosition}`);
    axios
      .patch<TableInfo>(`${this.tableApiUrl}/table`, {
        target_height: targetPosition,
      })
      .then((response) =>
        next(null, response.data['current_height'] === this.standingHeight)
      )
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }

  percentageToHeight(percentage: number) {
    return (
      this.sittingHeight +
      (Math.abs(this.sittingHeight - this.standingHeight) / 100) * percentage
    );
  }

  heightToPercentage(height: number) {
    return (
      ((height - this.sittingHeight) /
        (this.standingHeight - this.sittingHeight)) *
      100
    );
  }
}
