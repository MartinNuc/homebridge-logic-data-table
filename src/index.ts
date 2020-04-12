
import { LogicDataTableDeskFactory } from './logic-data-table-desk';

export default function (homebridge: any) {
  const service = homebridge.hap.Service;
  const characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(
    'logic-data-table-desk',
    'LogicDataTableDesk',
    LogicDataTableDeskFactory(service, characteristic)
  );
}