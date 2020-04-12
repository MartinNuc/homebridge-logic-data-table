export type Config = {
  sittingHeight: String;
  standingHeight: String;
  tableApiUrl: String;
};

export type TableInfo = {
  current_height: number;
  target_height: number;
  direction: string;
};
