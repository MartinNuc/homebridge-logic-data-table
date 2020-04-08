import axios from 'axios';

let service: any, characteristic: any;

type Config = {
  sittingHeight: String;
  standingHeight: String;
  tableApiUrl: String;
};

type TableInfo = {
  current_height: number;
  target_height: number;
};

export default function (homebridge: any) {
  service = homebridge.hap.Service;
  characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(
    'logic-data-table-desk',
    'LogicDataTableDesk',
    LogicDataTableDesk
  );
}

class LogicDataTableDesk {
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
      ?.on(
        'get',
        (next: Function) =>
          this.getCurrentPosition(next)
      )
      .on(
        'set',
        (on: boolean, next: Function) =>
          this.setSwitchOnCharacteristic(on, next)
      );

    return [informationService, windowService];
  }

  getCurrentPosition(next: Function) {
    axios
      .get<TableInfo>(`${this.tableApiUrl}/table`)
      .then((response) =>
        next(null, response.data['current_height'] === this.standingHeight)
      )
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }

  setSwitchOnCharacteristic(
    on: boolean,
    next: Function
  ) {
    axios
      .patch<TableInfo>(`${this.tableApiUrl}/table`, {
        target_height: on ? this.standingHeight : this.sittingHeight,
      })
      .then((response) =>
        next(null, response.data['current_height'] === this.standingHeight)
      )
      .catch((err) => {
        this.log(err.message);
        next(err);
      });
  }
}
