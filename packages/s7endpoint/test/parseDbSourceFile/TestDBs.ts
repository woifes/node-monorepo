// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { tS7Variable } from "packages/s7endpoint/src/types/S7Variable";
import { DbObject } from "../../src/parseDbSourceFile";

type DbTarget = {
    source: string;
    object: DbObject;
    variables: tS7Variable[];
};

//ALL TYPES

const ALL_TYPES_SOURCE = `
DATA_BLOCK "AllTypes"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Bool;   // Comment 1
      var_1_2 : Bool;   // Comment 1.2
      var_1_3 : Bool;   // Comment 1.3
      var_2 : Byte;   // Comment 2
      var_3 : Word;   // Comment 3
      var_4 : SInt;   // Comment 4
      var_5 : USInt;   // Comment 5
      var_6 : Int;   // Comment 6
      var_7 : UInt;   // Comment 7
      var_8 : DInt;   // Comment 8
      var_9 : UDInt;   // Comment 9
      var_10 : Time;   // Comment 10
      var_11 : Real;   // Comment 11
      var_12 : Array[1..3] of Bool;   // Comment 12
      var_13 : Array[1..3] of Byte;   // Comment 13
      var_14 : Array[1..3] of Word;   // Comment 14
      var_15 : Array[1..3] of SInt;   // Comment 15
      var_16 : Array[1..3] of USInt;   // Comment 16
      var_17 : Array[1..3] of Int;   // Comment 17
      var_18 : Array[1..3] of UInt;   // Comment 18
      var_19 : Array[1..3] of DInt;   // Comment 19
      var_20 : Array[1..3] of UDInt;   // Comment 20
      var_21 : Array[1..3] of Time;   // Comment 21
      var_22 : Array[1..3] of Real;   // Comment 22
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const ALL_TYPES_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment1",
    }, //Bool
    {
        name: "var_1_2",
        area: "DB",
        byteIndex: 0,
        bitIndex: 1,
        type: "BIT",
        comment: "Comment1.2",
    }, //Bool
    {
        name: "var_1_3",
        area: "DB",
        byteIndex: 0,
        bitIndex: 2,
        type: "BIT",
        comment: "Comment1.3",
    }, //Bool
    {
        name: "var_2",
        area: "DB",
        byteIndex: 1,
        type: "UINT8",
        comment: "Comment2",
    }, //Byte
    {
        name: "var_3",
        area: "DB",
        byteIndex: 2,
        type: "UINT16",
        comment: "Comment3",
    }, //Word
    {
        name: "var_4",
        area: "DB",
        byteIndex: 4,
        type: "INT8",
        comment: "Comment4",
    }, //SInt
    {
        name: "var_5",
        area: "DB",
        byteIndex: 5,
        type: "UINT8",
        comment: "Comment5",
    }, //USInt
    {
        name: "var_6",
        area: "DB",
        byteIndex: 6,
        type: "INT16",
        comment: "Comment6",
    }, //Int
    {
        name: "var_7",
        area: "DB",
        byteIndex: 8,
        type: "UINT16",
        comment: "Comment7",
    }, //UInt
    {
        name: "var_8",
        area: "DB",
        byteIndex: 10,
        type: "INT32",
        comment: "Comment8",
    }, //DInt
    {
        name: "var_9",
        area: "DB",
        byteIndex: 14,
        type: "UINT32",
        comment: "Comment9",
    }, //UDInt
    {
        name: "var_10",
        area: "DB",
        byteIndex: 18,
        type: "UINT32",
        comment: "Comment10",
    }, //Time
    {
        name: "var_11",
        area: "DB",
        byteIndex: 22,
        type: "FLOAT",
        comment: "Comment11",
    }, //Real
    {
        name: "var_12",
        area: "DB",
        byteIndex: 26,
        count: 3,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment12",
    }, //Array[1..3] of Bool
    {
        name: "var_13",
        area: "DB",
        byteIndex: 28,
        count: 3,
        type: "UINT8",
        comment: "Comment13",
    }, //Array[1..3] of Byte
    {
        name: "var_14",
        area: "DB",
        byteIndex: 32,
        count: 3,
        type: "UINT16",
        comment: "Comment14",
    }, //Array[1..3] of Word
    {
        name: "var_15",
        area: "DB",
        byteIndex: 38,
        count: 3,
        type: "INT8",
        comment: "Comment15",
    }, //Array[1..3] of SInt
    {
        name: "var_16",
        area: "DB",
        byteIndex: 42,
        count: 3,
        type: "UINT8",
        comment: "Comment16",
    }, //Array[1..3] of USInt
    {
        name: "var_17",
        area: "DB",
        byteIndex: 46,
        count: 3,
        type: "INT16",
        comment: "Comment17",
    }, //Array[1..3] of Int
    {
        name: "var_18",
        area: "DB",
        byteIndex: 52,
        count: 3,
        type: "UINT16",
        comment: "Comment18",
    }, //Array[1..3] of UInt
    {
        name: "var_19",
        area: "DB",
        byteIndex: 58,
        count: 3,
        type: "INT32",
        comment: "Comment19",
    }, //Array[1..3] of DInt
    {
        name: "var_20",
        area: "DB",
        byteIndex: 70,
        count: 3,
        type: "UINT32",
        comment: "Comment20",
    }, //Array[1..3] of UDInt
    {
        name: "var_21",
        area: "DB",
        byteIndex: 82,
        count: 3,
        type: "UINT32",
        comment: "Comment21",
    }, //Array[1..3] of Time
    {
        name: "var_22",
        area: "DB",
        byteIndex: 94,
        count: 3,
        type: "FLOAT",
        comment: "Comment22",
    }, //Array[1..3] of Real
];

const ALL_TYPES_OBJECT: DbObject = {
    var_1: "Bool;//Comment1",
    var_1_2: "Bool;//Comment1.2",
    var_1_3: "Bool;//Comment1.3",
    var_2: "Byte;//Comment2",
    var_3: "Word;//Comment3",
    var_4: "SInt;//Comment4",
    var_5: "USInt;//Comment5",
    var_6: "Int;//Comment6",
    var_7: "UInt;//Comment7",
    var_8: "DInt;//Comment8",
    var_9: "UDInt;//Comment9",
    var_10: "Time;//Comment10",
    var_11: "Real;//Comment11",
    var_12: "Array[1..3]ofBool;//Comment12",
    var_13: "Array[1..3]ofByte;//Comment13",
    var_14: "Array[1..3]ofWord;//Comment14",
    var_15: "Array[1..3]ofSInt;//Comment15",
    var_16: "Array[1..3]ofUSInt;//Comment16",
    var_17: "Array[1..3]ofInt;//Comment17",
    var_18: "Array[1..3]ofUInt;//Comment18",
    var_19: "Array[1..3]ofDInt;//Comment19",
    var_20: "Array[1..3]ofUDInt;//Comment20",
    var_21: "Array[1..3]ofTime;//Comment21",
    var_22: "Array[1..3]ofReal;//Comment22",
};

export const ALL_TYPES: DbTarget = {
    source: ALL_TYPES_SOURCE,
    object: ALL_TYPES_OBJECT,
    variables: ALL_TYPES_VARIABLES,
};

//BIT VARS IN A ROW

const BIT_VARS_IN_A_ROW_SOURCE = `
DATA_BLOCK "BitVarsInARow"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Bool;   // Comment 2
      var_3 : Bool;   // Comment 3
      var_4 : Bool;   // Comment 4
      var_5 : Bool;   // Comment 5
      var_6 : Bool;   // Comment 6
      var_7 : Bool;   // Comment 7
      var_8 : Bool;   // Comment 8
      var_9 : Bool;   // Comment 9
      var_10 : Bool;   // Comment 10
      var_11 : Bool;   // Comment 11
      var_12 : Bool;   // Comment 12
      var_13 : Bool;   // Comment 13
      var_14 : Byte;   // Comment 14
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const BIT_VARS_IN_A_ROW_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte
    {
        name: "var_2",
        area: "DB",
        byteIndex: 1,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment2",
    }, //Bool
    {
        name: "var_3",
        area: "DB",
        byteIndex: 1,
        bitIndex: 1,
        type: "BIT",
        comment: "Comment3",
    }, //Bool
    {
        name: "var_4",
        area: "DB",
        byteIndex: 1,
        bitIndex: 2,
        type: "BIT",
        comment: "Comment4",
    }, //Bool
    {
        name: "var_5",
        area: "DB",
        byteIndex: 1,
        bitIndex: 3,
        type: "BIT",
        comment: "Comment5",
    }, //Bool
    {
        name: "var_6",
        area: "DB",
        byteIndex: 1,
        bitIndex: 4,
        type: "BIT",
        comment: "Comment6",
    }, //Bool
    {
        name: "var_7",
        area: "DB",
        byteIndex: 1,
        bitIndex: 5,
        type: "BIT",
        comment: "Comment7",
    }, //Bool
    {
        name: "var_8",
        area: "DB",
        byteIndex: 1,
        bitIndex: 6,
        type: "BIT",
        comment: "Comment8",
    }, //Bool
    {
        name: "var_9",
        area: "DB",
        byteIndex: 1,
        bitIndex: 7,
        type: "BIT",
        comment: "Comment9",
    }, //Bool
    {
        name: "var_10",
        area: "DB",
        byteIndex: 2,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment10",
    }, //Bool
    {
        name: "var_11",
        area: "DB",
        byteIndex: 2,
        bitIndex: 1,
        type: "BIT",
        comment: "Comment11",
    }, //Bool
    {
        name: "var_12",
        area: "DB",
        byteIndex: 2,
        bitIndex: 2,
        type: "BIT",
        comment: "Comment12",
    }, //Bool
    {
        name: "var_13",
        area: "DB",
        byteIndex: 2,
        bitIndex: 3,
        type: "BIT",
        comment: "Comment13",
    }, //Bool
    {
        name: "var_14",
        area: "DB",
        byteIndex: 3,
        type: "UINT8",
        comment: "Comment14",
    }, //Byte
];

const BIT_VARS_IN_A_ROW_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: "Bool;//Comment2",
    var_3: "Bool;//Comment3",
    var_4: "Bool;//Comment4",
    var_5: "Bool;//Comment5",
    var_6: "Bool;//Comment6",
    var_7: "Bool;//Comment7",
    var_8: "Bool;//Comment8",
    var_9: "Bool;//Comment9",
    var_10: "Bool;//Comment10",
    var_11: "Bool;//Comment11",
    var_12: "Bool;//Comment12",
    var_13: "Bool;//Comment13",
    var_14: "Byte;//Comment14",
};

export const BIT_VARS_IN_A_ROW: DbTarget = {
    source: BIT_VARS_IN_A_ROW_SOURCE,
    variables: BIT_VARS_IN_A_ROW_VARIABLES,
    object: BIT_VARS_IN_A_ROW_OBJECT,
};

//DEEP STRUCT

const DEEP_STRUCT_SOURCE = `
DATA_BLOCK "DeepStruct"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Struct   // Comment 2
         var_2_1 : Byte;   // Comment 2_1
         var_2_2 : Struct   // Comment 2_2
            var_2_2_1 : Array[0..2] of Byte;   // Comment 2_2_1
            var_2_2_2 : DInt;   // Comment 2_2_2
            var_2_2_3 : Byte;   // Comment 2_2_3
            var_2_2_4 : Struct   // Comment 2_2_4
               var_2_2_4_1 : Byte;   // Comment 2_2_4_1
               var_2_2_4_2 : Array[1..3] of Struct   // Comment 2_2_4_2
                  var_2_2_4_2_1 : Byte;   // Comment 2_2_4_2_1
                  var_2_2_4_2_2 : Time;   // Comment 2_2_4_2_2
               END_STRUCT;
               var_2_2_4_3 : Byte;   // Comment 2_2_4_3
               var_2_2_4_4 : Array[1..3] of Bool;   // Comment 2_2_4_4
            END_STRUCT;
         END_STRUCT;
      END_STRUCT;
      var_3 : Struct   // Comment 3
         var_3_1 : Byte;   // Comment 3_1
         var_3_2 : DInt;   // Comment 3_2
      END_STRUCT;
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const DEEP_STRUCT_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte

    {
        name: "var_2/var_2_1",
        area: "DB",
        byteIndex: 2,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        name: "var_2/var_2_2/var_2_2_1",
        area: "DB",
        byteIndex: 4,
        count: 3,
        type: "UINT8",
        comment: "Comment2_2_1",
    }, //Array[0..2] of Byte
    {
        name: "var_2/var_2_2/var_2_2_2",
        area: "DB",
        byteIndex: 8,
        type: "INT32",
        comment: "Comment2_2_2",
    }, //DInt
    {
        name: "var_2/var_2_2/var_2_2_3",
        area: "DB",
        byteIndex: 12,
        type: "UINT8",
        comment: "Comment2_2_3",
    }, //Byte

    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_1",
        area: "DB",
        byteIndex: 14,
        type: "UINT8",
        comment: "Comment2_2_4_1",
    }, //Byte

    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/1/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 16,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/1/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 18,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/2/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 22,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/2/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 24,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/3/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 28,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/3/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 30,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_3",
        area: "DB",
        byteIndex: 34,
        type: "UINT8",
        comment: "Comment2_2_4_3",
    }, //Byte
    {
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_4",
        area: "DB",
        byteIndex: 36,
        count: 3,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment2_2_4_4",
    }, //Array[1..3] of Bool

    {
        name: "var_3/var_3_1",
        area: "DB",
        byteIndex: 38,
        type: "UINT8",
        comment: "Comment3_1",
    }, //Byte
    {
        name: "var_3/var_3_2",
        area: "DB",
        byteIndex: 40,
        type: "INT32",
        comment: "Comment3_2",
    }, //DInt
];

export const DEEP_STRUCT_TAGS: tS7Variable[] = [
    {
        dbNr: 1,
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte

    {
        dbNr: 1,
        name: "var_2/var_2_1",
        area: "DB",
        byteIndex: 2,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_1",
        area: "DB",
        byteIndex: 4,
        count: 3,
        type: "UINT8",
        comment: "Comment2_2_1",
    }, //Array[0..2] of Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_2",
        area: "DB",
        byteIndex: 8,
        type: "INT32",
        comment: "Comment2_2_2",
    }, //DInt
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_3",
        area: "DB",
        byteIndex: 12,
        type: "UINT8",
        comment: "Comment2_2_3",
    }, //Byte

    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_1",
        area: "DB",
        byteIndex: 14,
        type: "UINT8",
        comment: "Comment2_2_4_1",
    }, //Byte

    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/1/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 16,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/1/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 18,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/2/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 22,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/2/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 24,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/3/var_2_2_4_2_1",
        area: "DB",
        byteIndex: 28,
        type: "UINT8",
        comment: "Comment2_2_4_2_1",
    }, //Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_2/3/var_2_2_4_2_2",
        area: "DB",
        byteIndex: 30,
        type: "UINT32",
        comment: "Comment2_2_4_2_2",
    }, //Time

    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_3",
        area: "DB",
        byteIndex: 34,
        type: "UINT8",
        comment: "Comment2_2_4_3",
    }, //Byte
    {
        dbNr: 1,
        name: "var_2/var_2_2/var_2_2_4/var_2_2_4_4",
        area: "DB",
        byteIndex: 36,
        count: 3,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment2_2_4_4",
    }, //Array[1..3] of Bool

    {
        dbNr: 1,
        name: "var_3/var_3_1",
        area: "DB",
        byteIndex: 38,
        type: "UINT8",
        comment: "Comment3_1",
    }, //Byte
    {
        dbNr: 1,
        name: "var_3/var_3_2",
        area: "DB",
        byteIndex: 40,
        type: "INT32",
        comment: "Comment3_2",
    }, //DInt
];

const DEEP_STRUCT_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: {
        var_2_1: "Byte;//Comment2_1",
        var_2_2: {
            var_2_2_1: "Array[0..2]ofByte;//Comment2_2_1",
            var_2_2_2: "DInt;//Comment2_2_2",
            var_2_2_3: "Byte;//Comment2_2_3",
            var_2_2_4: {
                var_2_2_4_1: "Byte;//Comment2_2_4_1",
                var_2_2_4_2: {
                    "1": {
                        var_2_2_4_2_1: "Byte;//Comment2_2_4_2_1",
                        var_2_2_4_2_2: "Time;//Comment2_2_4_2_2",
                    },
                    "2": {
                        var_2_2_4_2_1: "Byte;//Comment2_2_4_2_1",
                        var_2_2_4_2_2: "Time;//Comment2_2_4_2_2",
                    },
                    "3": {
                        var_2_2_4_2_1: "Byte;//Comment2_2_4_2_1",
                        var_2_2_4_2_2: "Time;//Comment2_2_4_2_2",
                    },
                },
                var_2_2_4_3: "Byte;//Comment2_2_4_3",
                var_2_2_4_4: "Array[1..3]ofBool;//Comment2_2_4_4",
            },
        },
    },
    var_3: {
        var_3_1: "Byte;//Comment3_1",
        var_3_2: "DInt;//Comment3_2",
    },
};

export const DEEP_STRUCT: DbTarget = {
    source: DEEP_STRUCT_SOURCE,
    object: DEEP_STRUCT_OBJECT,
    variables: DEEP_STRUCT_VARIABLES,
};

//EVEN ADDRESS ARRAY

const EVEN_ADDRESS_ARRAY_SOURCE = `
DATA_BLOCK "EvenAdressArray"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Array[0..2] of USInt;   // Comment 2
      var_3 : Array[0..5] of Bool;   // Comment 3
      var_4 : Byte;   // Comment 4
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const EVEN_ADDRESS_ARRAY_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte
    {
        name: "var_2",
        area: "DB",
        byteIndex: 2,
        count: 3,
        type: "UINT8",
        comment: "Comment2",
    }, //Array[0..2] of USInt
    {
        name: "var_3",
        area: "DB",
        byteIndex: 6,
        count: 6,
        bitIndex: 0,
        type: "BIT",
        comment: "Comment3",
    }, //Array[0..5] of Bool
    {
        name: "var_4",
        area: "DB",
        byteIndex: 8,
        type: "UINT8",
        comment: "Comment4",
    }, //Byte
];

const EVEN_ADDRESS_ARRAY_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: "Array[0..2]ofUSInt;//Comment2",
    var_3: "Array[0..5]ofBool;//Comment3",
    var_4: "Byte;//Comment4",
};

export const EVEN_ADDRESS_ARRAY: DbTarget = {
    source: EVEN_ADDRESS_ARRAY_SOURCE,
    object: EVEN_ADDRESS_ARRAY_OBJECT,
    variables: EVEN_ADDRESS_ARRAY_VARIABLES,
};

//EVEN ADDRESS 2BYTE

const EVEN_ADDRESS_2BYTE_SOURCE = `
DATA_BLOCK "EvenAdressFor2Byte"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Word;   // Comment 2
      var_3 : Byte;   // Comment 3
      var_4 : Int;   // Comment 4
      var_5 : Byte;   // Comment 5
      var_6 : UInt;   // Comment 6
      var_7 : Byte;   // Comment 7
      var_8 : DInt;   // Comment 8
      var_9 : Byte;   // Comment 9
      var_10 : UDInt;   // Comment 10
      var_11 : Byte;   // Comment 11
      var_12 : Time;   // Comment 12
      var_13 : Byte;   // Comment 13
      var_14 : Real;   // Comment 14
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const EVEN_ADDRESS_2BYTE_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte
    {
        name: "var_2",
        area: "DB",
        byteIndex: 2,
        type: "UINT16",
        comment: "Comment2",
    }, //Word
    {
        name: "var_3",
        area: "DB",
        byteIndex: 4,
        type: "UINT8",
        comment: "Comment3",
    }, //Byte
    {
        name: "var_4",
        area: "DB",
        byteIndex: 6,
        type: "INT16",
        comment: "Comment4",
    }, //Int
    {
        name: "var_5",
        area: "DB",
        byteIndex: 8,
        type: "UINT8",
        comment: "Comment5",
    }, //Byte
    {
        name: "var_6",
        area: "DB",
        byteIndex: 10,
        type: "UINT16",
        comment: "Comment6",
    }, //UInt
    {
        name: "var_7",
        area: "DB",
        byteIndex: 12,
        type: "UINT8",
        comment: "Comment7",
    }, //Byte
    {
        name: "var_8",
        area: "DB",
        byteIndex: 14,
        type: "INT32",
        comment: "Comment8",
    }, //DInt
    {
        name: "var_9",
        area: "DB",
        byteIndex: 18,
        type: "UINT8",
        comment: "Comment9",
    }, //Byte
    {
        name: "var_10",
        area: "DB",
        byteIndex: 20,
        type: "UINT32",
        comment: "Comment10",
    }, //UDInt
    {
        name: "var_11",
        area: "DB",
        byteIndex: 24,
        type: "UINT8",
        comment: "Comment11",
    }, //Byte
    {
        name: "var_12",
        area: "DB",
        byteIndex: 26,
        type: "UINT32",
        comment: "Comment12",
    }, //Time
    {
        name: "var_13",
        area: "DB",
        byteIndex: 30,
        type: "UINT8",
        comment: "Comment13",
    }, //Byte
    {
        name: "var_14",
        area: "DB",
        byteIndex: 32,
        type: "FLOAT",
        comment: "Comment14",
    }, //Real
];

const EVEN_ADDRESS_2BYTE_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: "Word;//Comment2",
    var_3: "Byte;//Comment3",
    var_4: "Int;//Comment4",
    var_5: "Byte;//Comment5",
    var_6: "UInt;//Comment6",
    var_7: "Byte;//Comment7",
    var_8: "DInt;//Comment8",
    var_9: "Byte;//Comment9",
    var_10: "UDInt;//Comment10",
    var_11: "Byte;//Comment11",
    var_12: "Time;//Comment12",
    var_13: "Byte;//Comment13",
    var_14: "Real;//Comment14",
};

export const EVEN_ADDRESS_2BYTE: DbTarget = {
    source: EVEN_ADDRESS_2BYTE_SOURCE,
    object: EVEN_ADDRESS_2BYTE_OBJECT,
    variables: EVEN_ADDRESS_2BYTE_VARIABLES,
};

//EVEN ADDRESS STRUCT

const EVEN_ADDRESS_STRUCT_SOURCE = `
DATA_BLOCK "EvenAdressStruct"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Struct   // Comment 2
         var_2_1 : Byte;   // Comment 2_1
         var_2_2 : DInt;   // Comment 2_2
         var_2_3 : Byte;   // Comment 2_3
      END_STRUCT;
      var_3 : Byte;   // Comment 3
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const EVEN_ADDRESS_STRUCT_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte
    {
        name: "var_2/var_2_1",
        area: "DB",
        byteIndex: 2,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        name: "var_2/var_2_2",
        area: "DB",
        byteIndex: 4,
        type: "INT32",
        comment: "Comment2_2",
    }, //DInt
    {
        name: "var_2/var_2_3",
        area: "DB",
        byteIndex: 8,
        type: "UINT8",
        comment: "Comment2_3",
    }, //Byte
    {
        name: "var_3",
        area: "DB",
        byteIndex: 10,
        type: "UINT8",
        comment: "Comment3",
    }, //Byte
];

const EVEN_ADDRESS_STRUCT_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: {
        var_2_1: "Byte;//Comment2_1",
        var_2_2: "DInt;//Comment2_2",
        var_2_3: "Byte;//Comment2_3",
    },
    var_3: "Byte;//Comment3",
};

export const EVEN_ADDRESS_STRUCT: DbTarget = {
    source: EVEN_ADDRESS_STRUCT_SOURCE,
    object: EVEN_ADDRESS_STRUCT_OBJECT,
    variables: EVEN_ADDRESS_STRUCT_VARIABLES,
};

//EVEN ADDRESS STRUCT ARRAY

const EVEN_ADDRESS_STRUCT_ARRAY_SOURCE = `
DATA_BLOCK "EvenAdressStructArray"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1
NON_RETAIN
   STRUCT 
      var_1 : Byte;   // Comment 1
      var_2 : Array[0..2] of Struct   // Comment 2
         var_2_1 : Byte;   // Comment 2_1
         var_2_2 : Int;   // Comment 2_2
         var_2_3 : Byte;   // Comment 2_3
      END_STRUCT;
      var_3 : Byte;   // Comment 3
   END_STRUCT;


BEGIN

END_DATA_BLOCK
`;

const EVEN_ADDRESS_STRUCT_ARRAY_VARIABLES: tS7Variable[] = [
    {
        name: "var_1",
        area: "DB",
        byteIndex: 0,
        type: "UINT8",
        comment: "Comment1",
    }, //Byte

    {
        name: "var_2/0/var_2_1",
        area: "DB",
        byteIndex: 2,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        name: "var_2/0/var_2_2",
        area: "DB",
        byteIndex: 4,
        type: "INT16",
        comment: "Comment2_2",
    }, //Int
    {
        name: "var_2/0/var_2_3",
        area: "DB",
        byteIndex: 6,
        type: "UINT8",
        comment: "Comment2_3",
    }, //Byte

    {
        name: "var_2/1/var_2_1",
        area: "DB",
        byteIndex: 8,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        name: "var_2/1/var_2_2",
        area: "DB",
        byteIndex: 10,
        type: "INT16",
        comment: "Comment2_2",
    }, //Int
    {
        name: "var_2/1/var_2_3",
        area: "DB",
        byteIndex: 12,
        type: "UINT8",
        comment: "Comment2_3",
    }, //Byte

    {
        name: "var_2/2/var_2_1",
        area: "DB",
        byteIndex: 14,
        type: "UINT8",
        comment: "Comment2_1",
    }, //Byte
    {
        name: "var_2/2/var_2_2",
        area: "DB",
        byteIndex: 16,
        type: "INT16",
        comment: "Comment2_2",
    }, //Int
    {
        name: "var_2/2/var_2_3",
        area: "DB",
        byteIndex: 18,
        type: "UINT8",
        comment: "Comment2_3",
    }, //Byte

    {
        name: "var_3",
        area: "DB",
        byteIndex: 20,
        type: "UINT8",
        comment: "Comment3",
    }, //Byte
];

const EVEN_ADDRESS_STRUCT_ARRAY_OBJECT: DbObject = {
    var_1: "Byte;//Comment1",
    var_2: {
        "0": {
            var_2_1: "Byte;//Comment2_1",
            var_2_2: "Int;//Comment2_2",
            var_2_3: "Byte;//Comment2_3",
        },
        "1": {
            var_2_1: "Byte;//Comment2_1",
            var_2_2: "Int;//Comment2_2",
            var_2_3: "Byte;//Comment2_3",
        },
        "2": {
            var_2_1: "Byte;//Comment2_1",
            var_2_2: "Int;//Comment2_2",
            var_2_3: "Byte;//Comment2_3",
        },
    },
    var_3: "Byte;//Comment3",
};

export const EVEN_ADDRESS_STRUCT_ARRAY: DbTarget = {
    source: EVEN_ADDRESS_STRUCT_ARRAY_SOURCE,
    object: EVEN_ADDRESS_STRUCT_ARRAY_OBJECT,
    variables: EVEN_ADDRESS_STRUCT_ARRAY_VARIABLES,
};
