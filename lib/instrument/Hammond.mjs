import {MIDIInstrument} from './MIDIInstrument.mjs';
import {MIDI} from '../util/midi.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

const REVS_PER_SECOND = 1200.0 / 60;

// from http://www.goodeveca.net/RotorOrgan/ToneWheelSpec.html/
const ToneWheels = [
 {
   "Wheel Number": 1,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 2,
   "Note": "C",
   "Frequency": 32.692
 },
 {
   "Wheel Number": 2,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 2,
   "Note": "C#",
   "Frequency": 34.634
 },
 {
   "Wheel Number": 3,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 2,
   "Note": "D",
   "Frequency": 36.712
 },
 {
   "Wheel Number": 4,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 2,
   "Note": "D#",
   "Frequency": 38.889
 },
 {
   "Wheel Number": 5,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 2,
   "Note": "E",
   "Frequency": 41.200
 },
 {
   "Wheel Number": 6,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 2,
   "Note": "F",
   "Frequency": 43.636
 },
 {
   "Wheel Number": 7,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 2,
   "Note": "F#",
   "Frequency": 46.250
 },
 {
   "Wheel Number": 8,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 2,
   "Note": "G",
   "Frequency": 49.000
 },
 {
   "Wheel Number": 9,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 2,
   "Note": "G#",
   "Frequency": 51.892
 },
 {
   "Wheel Number": 10,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 2,
   "Note": "A",
   "Frequency": 55.000
 },
 {
   "Wheel Number": 11,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 2,
   "Note": "A#",
   "Frequency": 58.261
 },
 {
   "Wheel Number": 12,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 2,
   "Note": "B",
   "Frequency": 61.714
 },
 {
   "Wheel Number": 13,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 4,
   "Note": "C",
   "Frequency": 65.385
 },
 {
   "Wheel Number": 14,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 4,
   "Note": "C#",
   "Frequency": 69.268
 },
 {
   "Wheel Number": 15,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 4,
   "Note": "D",
   "Frequency": 73.425
 },
 {
   "Wheel Number": 16,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 4,
   "Note": "D#",
   "Frequency": 77.778
 },
 {
   "Wheel Number": 17,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 4,
   "Note": "E",
   "Frequency": 82.400
 },
 {
   "Wheel Number": 18,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 4,
   "Note": "F",
   "Frequency": 87.273
 },
 {
   "Wheel Number": 19,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 4,
   "Note": "F#",
   "Frequency": 92.500
 },
 {
   "Wheel Number": 20,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 4,
   "Note": "G",
   "Frequency": 98.000
 },
 {
   "Wheel Number": 21,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 4,
   "Note": "G#",
   "Frequency": 103.784
 },
 {
   "Wheel Number": 22,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 4,
   "Note": "A",
   "Frequency": 110.000
 },
 {
   "Wheel Number": 23,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 4,
   "Note": "A#",
   "Frequency": 116.522
 },
 {
   "Wheel Number": 24,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 4,
   "Note": "B",
   "Frequency": 123.429
 },
 {
   "Wheel Number": 25,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 8,
   "Note": "C",
   "Frequency": 130.769
 },
 {
   "Wheel Number": 26,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 8,
   "Note": "C#",
   "Frequency": 138.537
 },
 {
   "Wheel Number": 27,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 8,
   "Note": "D",
   "Frequency": 146.849
 },
 {
   "Wheel Number": 28,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 8,
   "Note": "D#",
   "Frequency": 155.556
 },
 {
   "Wheel Number": 29,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 8,
   "Note": "E",
   "Frequency": 164.800
 },
 {
   "Wheel Number": 30,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 8,
   "Note": "F",
   "Frequency": 174.545
 },
 {
   "Wheel Number": 31,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 8,
   "Note": "F#",
   "Frequency": 185.000
 },
 {
   "Wheel Number": 32,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 8,
   "Note": "G",
   "Frequency": 196.000
 },
 {
   "Wheel Number": 33,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 8,
   "Note": "G#",
   "Frequency": 207.568
 },
 {
   "Wheel Number": 34,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 8,
   "Note": "A",
   "Frequency": 220.000
 },
 {
   "Wheel Number": 35,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 8,
   "Note": "A#",
   "Frequency": 233.043
 },
 {
   "Wheel Number": 36,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 8,
   "Note": "B",
   "Frequency": 246.857
 },
 {
   "Wheel Number": 37,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 16,
   "Note": "C",
   "Frequency": 261.538
 },
 {
   "Wheel Number": 38,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 16,
   "Note": "C#",
   "Frequency": 277.073
 },
 {
   "Wheel Number": 39,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 16,
   "Note": "D",
   "Frequency": 293.699
 },
 {
   "Wheel Number": 40,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 16,
   "Note": "D#",
   "Frequency": 311.111
 },
 {
   "Wheel Number": 41,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 16,
   "Note": "E",
   "Frequency": 329.600
 },
 {
   "Wheel Number": 42,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 16,
   "Note": "F",
   "Frequency": 349.091
 },
 {
   "Wheel Number": 43,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 16,
   "Note": "F#",
   "Frequency": 370.000
 },
 {
   "Wheel Number": 44,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 16,
   "Note": "G",
   "Frequency": 392.000
 },
 {
   "Wheel Number": 45,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 16,
   "Note": "G#",
   "Frequency": 415.135
 },
 {
   "Wheel Number": 46,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 16,
   "Note": "A",
   "Frequency": 440.000
 },
 {
   "Wheel Number": 47,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 16,
   "Note": "A#",
   "Frequency": 466.087
 },
 {
   "Wheel Number": 48,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 16,
   "Note": "B",
   "Frequency": 493.714
 },
 {
   "Wheel Number": 49,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 32,
   "Note": "C",
   "Frequency": 523.077
 },
 {
   "Wheel Number": 50,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 32,
   "Note": "C#",
   "Frequency": 554.146
 },
 {
   "Wheel Number": 51,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 32,
   "Note": "D",
   "Frequency": 587.397
 },
 {
   "Wheel Number": 52,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 32,
   "Note": "D#",
   "Frequency": 622.222
 },
 {
   "Wheel Number": 53,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 32,
   "Note": "E",
   "Frequency": 659.200
 },
 {
   "Wheel Number": 54,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 32,
   "Note": "F",
   "Frequency": 698.182
 },
 {
   "Wheel Number": 55,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 32,
   "Note": "F#",
   "Frequency": 740.000
 },
 {
   "Wheel Number": 56,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 32,
   "Note": "G",
   "Frequency": 784.000
 },
 {
   "Wheel Number": 57,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 32,
   "Note": "G#",
   "Frequency": 830.270
 },
 {
   "Wheel Number": 58,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 32,
   "Note": "A",
   "Frequency": 880.000
 },
 {
   "Wheel Number": 59,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 32,
   "Note": "A#",
   "Frequency": 932.174
 },
 {
   "Wheel Number": 60,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 32,
   "Note": "B",
   "Frequency": 987.429
 },
 {
   "Wheel Number": 61,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 64,
   "Note": "C",
   "Frequency": 1046.154
 },
 {
   "Wheel Number": 62,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 64,
   "Note": "C#",
   "Frequency": 1108.293
 },
 {
   "Wheel Number": 63,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 64,
   "Note": "D",
   "Frequency": 1174.795
 },
 {
   "Wheel Number": 64,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 64,
   "Note": "D#",
   "Frequency": 1244.444
 },
 {
   "Wheel Number": 65,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 64,
   "Note": "E",
   "Frequency": 1318.400
 },
 {
   "Wheel Number": 66,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 64,
   "Note": "F",
   "Frequency": 1396.364
 },
 {
   "Wheel Number": 67,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 64,
   "Note": "F#",
   "Frequency": 1480.000
 },
 {
   "Wheel Number": 68,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 64,
   "Note": "G",
   "Frequency": 1568.000
 },
 {
   "Wheel Number": 69,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 64,
   "Note": "G#",
   "Frequency": 1660.541
 },
 {
   "Wheel Number": 70,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 64,
   "Note": "A",
   "Frequency": 1760.000
 },
 {
   "Wheel Number": 71,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 64,
   "Note": "A#",
   "Frequency": 1864.348
 },
 {
   "Wheel Number": 72,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 64,
   "Note": "B",
   "Frequency": 1974.857
 },
 {
   "Wheel Number": 73,
   "Gearing": {
    "Driving": 85,
    "Driven": 104
   },
   "Gear Ratio": 0.8173,
   "RPS": 16.3462,
   "Teeth": 128,
   "Note": "C",
   "Frequency": 2092.308
 },
 {
   "Wheel Number": 74,
   "Gearing": {
    "Driving": 71,
    "Driven": 82
   },
   "Gear Ratio": 0.8659,
   "RPS": 17.3171,
   "Teeth": 128,
   "Note": "C#",
   "Frequency": 2216.585
 },
 {
   "Wheel Number": 75,
   "Gearing": {
    "Driving": 67,
    "Driven": 73
   },
   "Gear Ratio": 0.9178,
   "RPS": 18.3562,
   "Teeth": 128,
   "Note": "D",
   "Frequency": 2349.589
 },
 {
   "Wheel Number": 76,
   "Gearing": {
    "Driving": 105,
    "Driven": 108
   },
   "Gear Ratio": 0.9722,
   "RPS": 19.4444,
   "Teeth": 128,
   "Note": "D#",
   "Frequency": 2488.889
 },
 {
   "Wheel Number": 77,
   "Gearing": {
    "Driving": 103,
    "Driven": 100
   },
   "Gear Ratio": 1.0300,
   "RPS": 20.6000,
   "Teeth": 128,
   "Note": "E",
   "Frequency": 2636.800
 },
 {
   "Wheel Number": 78,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 128,
   "Note": "F",
   "Frequency": 2792.727
 },
 {
   "Wheel Number": 79,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 128,
   "Note": "F#",
   "Frequency": 2960.000
 },
 {
   "Wheel Number": 80,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 128,
   "Note": "G",
   "Frequency": 3136.000
 },
 {
   "Wheel Number": 81,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 128,
   "Note": "G#",
   "Frequency": 3321.081
 },
 {
   "Wheel Number": 82,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 128,
   "Note": "A",
   "Frequency": 3520.000
 },
 {
   "Wheel Number": 83,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 128,
   "Note": "A#",
   "Frequency": 3728.696
 },
 {
   "Wheel Number": 84,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 128,
   "Note": "B",
   "Frequency": 3949.714
 },
 {
   "Wheel Number": 85,
   "Gearing": {
    "Driving": 84,
    "Driven": 77
   },
   "Gear Ratio": 1.0909,
   "RPS": 21.8182,
   "Teeth": 192,
   "Note": "~C",
   "Frequency": 4189.091
 },
 {
   "Wheel Number": 86,
   "Gearing": {
    "Driving": 74,
    "Driven": 64
   },
   "Gear Ratio": 1.1563,
   "RPS": 23.1250,
   "Teeth": 192,
   "Note": "~C#",
   "Frequency": 4440.000
 },
 {
   "Wheel Number": 87,
   "Gearing": {
    "Driving": 98,
    "Driven": 80
   },
   "Gear Ratio": 1.2250,
   "RPS": 24.5000,
   "Teeth": 192,
   "Note": "~D",
   "Frequency": 4704.000
 },
 {
   "Wheel Number": 88,
   "Gearing": {
    "Driving": 96,
    "Driven": 74
   },
   "Gear Ratio": 1.2973,
   "RPS": 25.9459,
   "Teeth": 192,
   "Note": "~D#",
   "Frequency": 4981.622
 },
 {
   "Wheel Number": 89,
   "Gearing": {
    "Driving": 88,
    "Driven": 64
   },
   "Gear Ratio": 1.3750,
   "RPS": 27.5000,
   "Teeth": 192,
   "Note": "~E",
   "Frequency": 5280.000
 },
 {
   "Wheel Number": 90,
   "Gearing": {
    "Driving": 67,
    "Driven": 46
   },
   "Gear Ratio": 1.4565,
   "RPS": 29.1304,
   "Teeth": 192,
   "Note": "~F",
   "Frequency": 5593.043
 },
 {
   "Wheel Number": 91,
   "Gearing": {
    "Driving": 108,
    "Driven": 70
   },
   "Gear Ratio": 1.5429,
   "RPS": 30.8571,
   "Teeth": 192,
   "Note": "~F#",
   "Frequency": 5924.571
 }
];

export class Hammond extends MIDIInstrument {
  
  #hammondMessageHandlers = new Map([
    [
      MIDI.Note_On, (message, time) => {
        const root = Hammond.midiNoteToToneWheel(message.note);
        
        this.toneWheels[root - 12]?.connect(this.drawBars[0]);
        this.toneWheels[root + 7]?.connect(this.drawBars[1]);
        this.toneWheels[root]?.connect(this.drawBars[2]);
        // this.toneWheels[root + 12]?.connect(this.drawBars[3]);
        this.toneWheels[root + 19]?.connect(this.drawBars[4]);
        this.toneWheels[root - 24]?.connect(this.drawBars[5]);
        // this.toneWheels[root - 28]?.connect(this.drawBars[6]);
        // this.toneWheels[root - 31]?.connect(this.drawBars[7]);
        // this.toneWheels[root - 36]?.connect(this.drawBars[8]);
      }
    ],
    [
      MIDI.Note_Off, (message, time) => {
        const root = Hammond.midiNoteToToneWheel(message.note);
        
        this.toneWheels[root - 12]?.disconnect(this.drawBars[0]);
        this.toneWheels[root + 7]?.disconnect(this.drawBars[1]);
        this.toneWheels[root]?.disconnect(this.drawBars[2]);
        // this.toneWheels[root + 12]?.disconnect(this.drawBars[3]);
        this.toneWheels[root + 19]?.disconnect(this.drawBars[4]);
        this.toneWheels[root - 24]?.disconnect(this.drawBars[5]);
        // this.toneWheels[root - 28]?.disconnect(this.drawBars[6]);
        // this.toneWheels[root - 31]?.disconnect(this.drawBars[7]);
        // this.toneWheels[root - 36]?.disconnect(this.drawBars[8]);
      },
    ],
    // [
    //   MIDI.Polyphonic_Key_Pressure, (message) => {
    //     this.voices[message.note].changeVolume(message.pressure / 127.0);
    //   }
    // ],
    [
      MIDI.All_Notes_Off, (message, time) => {
        // this.synth.stopAll(time);
      }
    ]
  ]);
  
  constructor(config = {}) {
    super({...config, ...{
      inputs: [
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 16'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 5 1/3'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 8'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 4'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 2 2/3'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 2'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 1 3/5'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 1 1/3'
          }
        },
        {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Drawbar 1'
          }
        }
      ],
      enabled: true,
      name: 'Hammond Organ'
    }});
    
    this.delayBus = new GainNode(GlobalScheduler.audioContext);
    
    this.toneWheels = ToneWheels.map((wheel) => {
      const freq = REVS_PER_SECOND * wheel.Teeth * wheel.Gearing.Driving / wheel.Gearing.Driven;
      
      const osc = new OscillatorNode(GlobalScheduler.audioContext, {
        type: "sine",
        frequency: freq
      });
      osc.start();
      return osc;
    });
    
    this.drawBars = Array.from(this.inputs.keys())
      .filter((node) => {
        return this.inputs.get(node).type == 'AudioParam';
      })
      .map((node) => {
        const drawBar = GlobalScheduler.audioContext.createGain();
        node.connect(drawBar.gain);
        drawBar.connect(this.delayBus);
        // drawBar.connect(this.getNamedOutput('Main Out').node);
        return drawBar;
      }
    );
    
    this.vibrato = new AudioWorkletNode(GlobalScheduler.audioContext, 'hammondVibrato-processor', {numberOfInputs: 18});
    
    this.delayBus.connect(this.vibrato, 0, 0);
    
    this.delays = [];
    for (let i = 1; i <= 16; i++) {
      const dNode = new DelayNode(GlobalScheduler.audioContext, {
        delayTime: i / 1000
      });
      this.delays.push(dNode);
      this.delayBus.connect(dNode);
      
      dNode.connect(this.vibrato, 0, i+1);
    }
    
    this.vibratoSpeed = new OscillatorNode(GlobalScheduler.audioContext, {
      frequency: 14.0,
      type: 'sawtooth'//triangle'
    });
    this.vibratoSpeed.start();
    
    this.vibratoSpeed.connect(this.vibrato, 0, 1);
    
    this.vibrato.connect(this.getNamedOutput('Main Out').node);
    // this.delayBus.connect(this.getNamedOutput('Main Out').node);
  }
  
  get messageHandlers() {
    return this.#hammondMessageHandlers;
  }
  
  static midiNoteToToneWheel(note) {
    return note - 23 - 1;
  }
  
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/hammondVibrato-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});