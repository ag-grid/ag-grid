import {ChangeDetectionService, ChangeDetectionStrategyType} from "../changeDetectionService";

let service: ChangeDetectionService;

beforeEach(() => {
    service = new ChangeDetectionService();
});

it('deep value check equivalent (boolean) scalar values return true', async () => {
    // given
    const firstValue = true;
    const secondValue = true;

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(true);
});

it('deep value check different (boolean) scalar values return false', async () => {
    // given
    const firstValue = false;
    const secondValue = true;

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(false);
});

it('deep value check equivalent (string) scalar values return true', async () => {
    // given
    const firstValue = "Bob";
    const secondValue = "Bob";

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(true);
});

it('deep value check different (string) scalar values return false', async () => {
    // given
    const firstValue = "Bob";
    const secondValue = "Mary";

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(false);
});

it('deep value check equivalent (integer) scalar values return true', async () => {
    // given
    const firstValue = 100;
    const secondValue = 100;

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(true);
});

it('deep value check different (integer) scalar values return false', async () => {
    // given
    const firstValue = 100;
    const secondValue = 200;

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(false);
});

it('deep value check equivalent of scalar array values return true', async () => {
    // given
    const firstValue = [1, 2, 3];
    const secondValue = [1, 2, 3];

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(true);
});

it('deep value check of different scalar array values return true', async () => {
    // given
    const firstValue = [1, 2, 3];
    const secondValue = [1, 2, 4];

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(false);
});

it('deep value check equivalent of complex array values return true', async () => {
    // given
    const firstValue = [{
        someVar: true,
        someOtherVar: "wibble"
    }];
    const secondValue = [{
        someVar: true,
        someOtherVar: "wibble"
    }];

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(true);
});

it('deep value check of different complex array values return false', async () => {
    // given
    const firstValue = [{
        someVar: true,
        someOtherVar: "wibble"
    }];
    const secondValue = [{
        someVar: false,
        someOtherVar: "wobble"
    }];

    let strategy = service.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

    // when
    const areEqual = strategy.areEqual(firstValue, secondValue);

    expect(areEqual).toBe(false);
});



