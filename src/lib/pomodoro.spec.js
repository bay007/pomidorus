import Pomodoro from './pomodoro';

describe('Pomodoro', () => {
  let pomodoro = null;
  let now = null;
  let t = null;

  const prepare = (state = {}) => {
    pomodoro = new Pomodoro(state);
    now = new Date(pomodoro.createdAt);
    t = now.getTime();
  };

  describe('initialize', () => {
    it('should initialize state', () => {
      prepare({
        createdAt: new Date().toISOString(),
        type: 'example',
      });

      expect(pomodoro.createdAt).toBe(now.toISOString());
      expect(pomodoro.type).toBe('example');
    });
  });

  describe('interval', () => {
    it('should return difference in time', () => {
      prepare();
      spyOnProperty(pomodoro, 'now', 'get').and.returnValue(now);

      expect(pomodoro.interval).toBe(0);
      now.setTime(t + 1000);
      expect(pomodoro.interval).toBe(1000);
    });
  });

  describe('finished', () => {
    it('should return true when finished', () => {
      prepare({
        duration: 1000,
      });

      spyOnProperty(pomodoro, 'now', 'get').and.returnValue(now);

      expect(pomodoro.finished).toBe(false);
      now.setTime(t + 500);
      expect(pomodoro.finished).toBe(false);
      now.setTime(t + 1000);
      expect(pomodoro.finished).toBe(true);
    });
  });

  describe('pause', () => {
    it('should add paused with start', () => {
      prepare();
      spyOnProperty(pomodoro, 'now', 'get').and.returnValue(now);

      expect(pomodoro.state.pauses).toEqual([]);

      pomodoro.pause();

      expect(pomodoro.state.pauses.length).toBe(1);

      pomodoro.pause();

      expect(pomodoro.state.pauses.length).toBe(1);
      expect(pomodoro.state.pauses[0].start).toEqual(now.toISOString());
      expect(pomodoro.state.pauses[0].end).toBeNull();
    });
  });

  describe('unpause', () => {
    it('should add paused with end', () => {
      prepare();
      spyOnProperty(pomodoro, 'now', 'get').and.returnValue(now);

      pomodoro.pause();
      now.setTime(t + 1000);
      pomodoro.unpause();

      expect(pomodoro.state.pauses.length).toBe(1);
      expect(pomodoro.state.pauses[0].start).toEqual((new Date(t).toISOString()));
      expect(pomodoro.state.pauses[0].end).toEqual(now.toISOString());

      pomodoro.pause();
      now.setTime(t + 2000);
      pomodoro.unpause();

      expect(pomodoro.state.pauses.length).toBe(2);

      pomodoro.pause();
      now.setTime(t + 2000);
      pomodoro.unpause();

      expect(pomodoro.state.pauses.length).toBe(2);
    });
  });

  describe('paused', () => {
    it('should return current pause state', () => {
      prepare();
      expect(pomodoro.paused).toBeFalsy();
      pomodoro.pause();
      expect(pomodoro.paused).toBeTruthy();
      pomodoro.unpause();
      expect(pomodoro.paused).toBeFalsy();
    });
  });

  describe('pauses', () => {
    it('should total paused time', () => {
      prepare();

      const getTime = x => new Date(t + x).toISOString();
      const current = new Date(getTime(75));

      spyOnProperty(pomodoro, 'now', 'get').and.returnValue(current);

      pomodoro.state.pauses = [
        { start: getTime(10), end: getTime(20) },
        { start: getTime(30), end: getTime(40) },
        { start: getTime(50), end: null },
      ];

      expect(pomodoro.pauses).toBe(45);
    });
  });
});
