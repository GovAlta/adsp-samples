describe('activityHandler', () => {
  it('can parse ask', () => {
    const [askMatch, acronym] = /^\s*([a-zA-Z0-9]{1,20})\s*$/g.exec(' YMMV  ');

    expect(askMatch).toBeTruthy();
    expect(acronym).toBe('YMMV');
  });

  it('can parse ask with no match', () => {
    const [askMatch] =
      /^\s*([a-zA-Z0-9]{1,20})\s*$/g.exec(' YMM-V  ') || [];

    expect(askMatch).toBeFalsy();
  });

  it('can parse submission', () => {
    const [submissionMatch, acronym, represents] =
      /^\s*([a-zA-Z0-9]{1,20})\s?=\s?(.{1,150})$/g.exec(
        'YMMV = Your Mileage May Vary'
      );

    expect(submissionMatch).toBeTruthy();
    expect(acronym).toBe('YMMV');
    expect(represents).toBe('Your Mileage May Vary');
  });

  it('can parse submission with no match', () => {
    const [submissionMatch] =
      /^\s*([a-zA-Z0-9]{1,20})\s?=\s?(.{1,150})$/g.exec('YMMV') || [];

    expect(submissionMatch).toBeFalsy();
  });
});
