// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { TopicMap } from "../../src/utils/TopicMap";

function gt(code: string): string[] {
    const res = [];
    for (let i = 0; i < code.length; i++) {
        res.push(code[i]);
    }
    return res;
}

const A = gt("A");
const B = gt("B");
const C = gt("C");
const AA = gt("AA");
const AB = gt("AB");
const AC = gt("AC");
const BA = gt("BA");
const BB = gt("BB");
const BC = gt("BC");
const CA = gt("CA");
const CB = gt("CB");
const CC = gt("CC");
const AAA = gt("AAA");
const AAB = gt("AAB");
const AAC = gt("AAC");
const ABA = gt("ABA");
const ABB = gt("ABB");
const ABC = gt("ABC");
const ACA = gt("ACA");
const ACB = gt("ACB");
const ACC = gt("ACC");
const BAA = gt("BAA");
const BAB = gt("BAB");
const BAC = gt("BAC");
const BBA = gt("BBA");
const BBB = gt("BBB");
const BBC = gt("BBC");
const BCA = gt("BCA");
const BCB = gt("BCB");
const BCC = gt("BCC");

test("insert and get", () => {
    let m = new TopicMap<number>(false);
    //one level
    m.setValue(A, 1);
    m.setValue(B, 2);
    m.setValue(C, 3);
    expect(m.getValue(A)).toBe(1);
    expect(m.getValue(B)).toBe(2);
    expect(m.getValue(C)).toBe(3);
    //two level
    m.setValue(AA, 1);
    m.setValue(AB, 2);
    m.setValue(AC, 3);
    expect(m.getValue(AA)).toBe(1);
    expect(m.getValue(AB)).toBe(2);
    expect(m.getValue(AC)).toBe(3);
    //three levels
    m.setValue(AAA, 1);
    m.setValue(AAB, 2);
    m.setValue(AAC, 3);
    expect(m.getValue(AAA)).toBe(1);
    expect(m.getValue(AAB)).toBe(2);
    expect(m.getValue(AAC)).toBe(3);
    //re asign
    m.setValue(AAA, 10);
    m.setValue(AAB, 20);
    m.setValue(AAC, 30);
    expect(m.getValue(AAA)).toBe(10);
    expect(m.getValue(AAB)).toBe(20);
    expect(m.getValue(AAC)).toBe(30);

    m.setValue(gt("A+A"), 991);
    expect(m.getValue(gt("A+A"))).toBeUndefined();
    m.setValue(gt("A#"), 992);
    expect(m.getValue(gt("A#"))).toBeUndefined();

    m = new TopicMap<number>(true);
    m.setValue(gt("A+A"), 991);
    expect(m.getValue(gt("A+A"))).toBe(991);
    m.setValue(gt("A#"), 992);
    expect(m.getValue(gt("A#"))).toBe(992);
    m.setValue(gt("#A"), 992);
    expect(m.getValue(gt("#A"))).toBeUndefined();
});

test("delete", () => {
    const m = new TopicMap<number>(false);
    m.setValue(AAA, 1);
    m.setValue(AAB, 2);
    m.setValue(AA, 3);
    m.setValue(B, 11);

    //sub level delte does not the higher levels
    m.deleteValue(AA);
    expect(m.getValue(AAA)).toBe(1);
    expect(m.getValue(AAB)).toBe(2);
    expect(m.getValue(AA)).toBeUndefined();
    expect(m.getValue(B)).toBe(11);

    //neighbor delet does not delete the whole branch
    m.deleteValue(AAB);
    expect(m.getValue(AAA)).toBe(1);
    expect(m.getValue(AAB)).toBeUndefined();
    expect(m.getValue(AA)).toBeUndefined();
    expect(m.getValue(B)).toBe(11);

    m.deleteValue(AAA);
    expect(m.getValue(AAA)).toBeUndefined();
    expect(m.getValue(AAB)).toBeUndefined();
    expect(m.getValue(AA)).toBeUndefined();
    expect(m.getValue(B)).toBe(11);
});

test("delete by filter", () => {
    //one level
    let m = new TopicMap<number>(false);
    m.setValue(A, 1);
    m.setValue(B, 20);
    m.setValue(C, 100);
    m.deleteByFiler((n: number) => {
        return n > 10 && n < 100;
    });
    expect(m.getValue(A)).toBe(1);
    expect(m.getValue(B)).toBeUndefined();
    expect(m.getValue(C)).toBe(100);

    //delete neighbours
    m = new TopicMap<number>(false);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);
    m.setValue(AA, 100);
    m.deleteByFiler((n: number) => {
        return n < 100;
    });
    expect(m.getValue(AAA)).toBeUndefined();
    expect(m.getValue(AAB)).toBeUndefined();
    expect(m.getValue(AA)).toBe(100);

    //delete previous
    m = new TopicMap<number>(false);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);
    m.setValue(AA, 100);
    m.deleteByFiler((n: number) => {
        return n >= 100;
    });
    expect(m.getValue(AAA)).toBe(1);
    expect(m.getValue(AAB)).toBe(20);
    expect(m.getValue(AA)).toBeUndefined();
});

test("all values", () => {
    const m = new TopicMap<number>(false);
    //one level
    m.setValue(A, 1);
    m.setValue(B, 2);
    m.setValue(C, 3);
    let it = m.allValues();
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 2, done: false });
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    //two level
    m.setValue(AA, 10);
    m.setValue(AB, 20);
    m.setValue(AC, 30);
    it = m.allValues();
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 10, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: 30, done: false });
    expect(it.next()).toEqual({ value: 2, done: false });
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    //three levels
    m.setValue(AAA, 100);
    m.setValue(AAB, 200);
    m.setValue(AAC, 300);
    it = m.allValues();
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 10, done: false });
    expect(it.next()).toEqual({ value: 100, done: false });
    expect(it.next()).toEqual({ value: 200, done: false });
    expect(it.next()).toEqual({ value: 300, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: 30, done: false });
    expect(it.next()).toEqual({ value: 2, done: false });
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    //re asign
    m.setValue(AAA, 1000);
    m.setValue(AAB, 2000);
    m.setValue(AAC, 3000);
    it = m.allValues();
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 10, done: false });
    expect(it.next()).toEqual({ value: 1000, done: false });
    expect(it.next()).toEqual({ value: 2000, done: false });
    expect(it.next()).toEqual({ value: 3000, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: 30, done: false });
    expect(it.next()).toEqual({ value: 2, done: false });
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
});

test("find values", () => {
    //Exact match
    let m = new TopicMap<number>(false);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);

    let it = m.findValues(AAA);
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    it = m.findValues(BA);
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    it = m.findValues(A);
    expect(it.next()).toEqual({ value: 9, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    //Wildcards
    m = new TopicMap<number>(false);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(BBA, 21);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);

    it = m.findValues(gt("+"));
    expect(it.next()).toEqual({ value: 9, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("B+"));
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("++"));
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: 100, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("AA+"));
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("A++"));
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("+A+"));
    expect(it.next()).toEqual({ value: 7, done: false });
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("+++"));
    expect(it.next()).toEqual({ value: 7, done: false });
    expect(it.next()).toEqual({ value: 21, done: false });
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("A#"));
    expect(it.next()).toEqual({ value: 100, done: false });
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 20, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("#"));
    expect(it.next()).toEqual({ value: 3, done: false }); //BA
    expect(it.next()).toEqual({ value: 7, done: false }); //BAA
    expect(it.next()).toEqual({ value: 21, done: false }); //BBA
    expect(it.next()).toEqual({ value: 9, done: false }); //A
    expect(it.next()).toEqual({ value: 100, done: false }); //AA
    expect(it.next()).toEqual({ value: 1, done: false }); //AAA
    expect(it.next()).toEqual({ value: 20, done: false }); //AAB
    expect(it.next()).toEqual({ value: undefined, done: true });
});

test("find values with wildcard inserts", () => {
    //Exact match
    let m = new TopicMap<number>(true);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);

    m.setValue(gt("#"), 991);
    m.setValue(gt("A#"), 992);
    m.setValue(gt("AA+"), 993);
    m.setValue(gt("+A+"), 994);
    m.setValue(gt("+#"), 999);

    let it = m.findValues(AAA);
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next()).toEqual({ value: 993, done: false });
    expect(it.next()).toEqual({ value: 992, done: false });
    expect(it.next()).toEqual({ value: 994, done: false });
    expect(it.next()).toEqual({ value: 999, done: false });
    expect(it.next()).toEqual({ value: 991, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    it = m.findValues(BA);
    expect(it.next()).toEqual({ value: 3, done: false });
    expect(it.next()).toEqual({ value: 999, done: false });
    expect(it.next()).toEqual({ value: 991, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });
    it = m.findValues(A);
    expect(it.next()).toEqual({ value: 9, done: false });
    expect(it.next()).toEqual({ value: 991, done: false });
    expect(it.next()).toEqual({ value: undefined, done: true });

    //Wildcards
    m = new TopicMap<number>(true);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(BBA, 21);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);

    m.setValue(gt("#"), 991);
    m.setValue(gt("A#"), 992);
    m.setValue(gt("AA+"), 993);
    m.setValue(gt("+A+"), 994);
    m.setValue(gt("+#"), 999);

    it = m.findValues(gt("+"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("B+"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("++"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("AA+"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("A++"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("+A+"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("+++"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("A#"));
    expect(it.next()).toEqual({ value: undefined, done: true });

    it = m.findValues(gt("#"));
    expect(it.next()).toEqual({ value: undefined, done: true });
});

it("should return the correct object for generateObject", () => {
    const m = new TopicMap<number>(false);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(BBA, 21);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);
    expect(m.generateObject("#", (n) => n * 2)).toEqual({
        B: {
            A: {
                "#": 6,
                A: 14,
            },
            B: {
                A: 42,
            },
        },
        A: {
            "#": 18,
            A: {
                "#": 200,
                A: 2,
                B: 40,
            },
        },
    });
});

it("should return the correct json format on toJSON", () => {
    const m = new TopicMap<number>(false);
    m.setValue(BA, 3);
    m.setValue(BAA, 7);
    m.setValue(BBA, 21);
    m.setValue(A, 9);
    m.setValue(AA, 100);
    m.setValue(AAA, 1);
    m.setValue(AAB, 20);
    expect(m.toJSON()).toEqual({
        B: {
            A: {
                "": 3,
                A: 7,
            },
            B: {
                A: 21,
            },
        },
        A: {
            "": 9,
            A: {
                "": 100,
                A: 1,
                B: 20,
            },
        },
    });
});
