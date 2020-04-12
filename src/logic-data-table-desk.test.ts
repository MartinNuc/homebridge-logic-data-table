import { LogicDataTableDesk } from './logic-data-table-desk';

describe('LogicDataTableDesk', () => {
  let desk: LogicDataTableDesk;
  beforeEach(() => {
    desk = new LogicDataTableDesk(console.log, {
      sittingHeight: '75',
      standingHeight: '125',
      tableApiUrl: 'https://localhost'
    });
  })

  test('it converts percentage to height', () => {
    expect(desk.percentageToHeight(0)).toBe(75);
    expect(desk.percentageToHeight(50)).toBe(100);
    expect(desk.percentageToHeight(100)).toBe(125);
  });

  test('it converts height to percentage', () => {
    expect(desk.heightToPercentage(75)).toBe(0);
    expect(desk.heightToPercentage(100)).toBe(50);
    expect(desk.heightToPercentage(125)).toBe(100);
  });

})
