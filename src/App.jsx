import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Lightbulb, BookOpen, Trophy, Timer, Lock, Play, CheckCircle2, XCircle, RotateCcw, Image as ImageIcon, UserRound, LogOut, Volume2, VolumeX, Crosshair, ArrowRight, X, Search } from 'lucide-react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { arrayUnion, collection, doc, getDoc, increment, onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from './firebase.js';
// ================= DATOS =================
const dbQuestions = [
  { q: "2^3 \\times 2^2", a: "32" }, { q: "\\sqrt{25} + |-5|", a: "10" }, { q: "\\frac{3}{4} + \\frac{1}{4}", a: "1" },
  { q: "5 \\times (4 - 2)", a: "10" }, { q: "|-8| - 3", a: "5" }, { q: "\\sqrt[3]{8}", a: "2" },
  { q: "\\frac{10}{2} \\times 3", a: "15" }, { q: "4^0 + 7", a: "8" }, { q: "\\frac{1}{2} \\times 4", a: "2" },
  { q: "-(-5) + |-2|", a: "7" }, { q: "\\sqrt{16} \\times |-3|", a: "12" }, { q: "\\frac{5^4}{5^2}", a: "25" },
  { q: "\\frac{1}{2} + \\frac{1}{3}", a: "\\frac{5}{6}" }, { q: "\\frac{|-10|}{\\sqrt{25}}", a: "2" }, { q: "3^2 - \\sqrt[3]{27}", a: "6" },
  { q: "\\frac{(2^3)^2}{4}", a: "16" }, { q: "5 \\times |-2| - 4", a: "6" }, { q: "\\sqrt{9 \\times 4}", a: "6" },
  { q: "\\frac{2}{5} \\times \\frac{15}{4}", a: "\\frac{3}{2}" }, { q: "|-7 + 2| \\times 3", a: "15" }, { q: "\\frac{\\sqrt{144}}{2^2}", a: "3" },
  { q: "2^{-1} + 3^{-1}", a: "\\frac{5}{6}" }, { q: "|-4| \\times |-5|", a: "20" }, { q: "\\sqrt[3]{-8} + 5", a: "3" },
  { q: "\\frac{3}{2} \\div \\frac{1}{4}", a: "6" }, { q: "(5 - 7)^3", a: "-8" }, { q: "10 - 2 \\times |-4|", a: "2" },
  { q: "\\sqrt{25 - 9}", a: "4" }, { q: "\\frac{4^2}{\\sqrt{64}}", a: "2" }, { q: "\\frac{7}{3} - \\frac{1}{3} \\times 2", a: "\\frac{5}{3}" }
];
// ================= DATOS TEMA 2 =================
const huertoQuestions = [
  {
    id: 1,
    title: "Subpregunta 1: Área Total (Binomio al cuadrado)",
    desc: "El lado total del huerto mide (x + 5) metros. Desarrolla la expresión de su área total: (x + 5)^2.",
    options: ["x^2 + 25", "x^2 + 10x + 25", "x^2 + 5x + 25", "x^2 + 10x + 10"],
    correct: "x^2 + 10x + 25",
    solution: "(a + b)^2 = a^2 + 2ab + b^2 \\rightarrow (x + 5)^2 = x^2 + 2(5)(x) + 5^2 = \\mathbf{x^2 + 10x + 25}"
  },
  {
    id: 2,
    title: "Subpregunta 2: Superficie Libre (Diferencia de cuadrados)",
    desc: "El marco de madera ocupa un área de 25 m^2. Factoriza la expresión que representa la superficie libre para sembrar: (x + 5)^2 - 5^2.",
    options: ["x(x + 10)", "(x - 5)(x + 5)", "x(x + 5)", "x^2 + 10x"],
    correct: "x(x + 10)",
    solution: "a^2 - b^2 = (a-b)(a+b) \\rightarrow ((x+5) - 5)((x+5) + 5) = x(x + 10) = \\mathbf{x(x + 10)}"
  },
  {
    id: 3,
    title: "Subpregunta 3: Parcela Contigua (Trinomio x^2 + bx + c)",
    desc: "El área de una parcela rectangular contigua está dada por x^2 + 7x + 12. Factorízalo para hallar las expresiones de su base y su altura.",
    options: ["(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x + 3)(x + 4)", "(x - 3)(x - 4)"],
    correct: "(x + 3)(x + 4)",
    solution: "Buscamos dos números que multiplicados den 12 y sumados den 7 (son 3 y 4): \\mathbf{(x + 3)(x + 4)}"
  }
];

// ================= DATOS TEMA 3: ECUACIONES =================
const foodTruckQuestions = [
  {
    id: 1,
    title: "Subpregunta 1: Ecuación Lineal - Meta de Ventas",
    desc: "Ganas $8 por combo de hamburguesa, pagas $40 fijos de alquiler del espacio y buscas obtener $120 de ganancia neta en la jornada. Resuelve 8x - 40 = 120 para hallar la cantidad de combos (x) que debes vender.",
    options: ["x = 15", "x = 20", "x = 10", "x = 25"],
    correct: "x = 20",
    solution: "8x - 40 = 120 \\rightarrow 8x = 160 \\rightarrow x = \\frac{160}{8} \\rightarrow \\mathbf{x = 20}"
  },
  {
    id: 2,
    title: "Subpregunta 2: Ecuación Cuadrática - Ancho del Mostrador",
    desc: "Para optimizar el diseño del Food Truck, el área de trabajo requiere definir el ancho del mostrador (x en metros) resolviendo la ecuación cuadrática: x^2 - 7x + 10 = 0.",
    options: ["x = 1 \\text{ y } x = 10", "x = 2 \\text{ y } x = 5", "x = -2 \\text{ y } x = -5", "x = 3 \\text{ y } x = 4"],
    correct: "x = 2 \\text{ y } x = 5",
    solution: "(x - 2)(x - 5) = 0 \\rightarrow x - 2 = 0 \\text{ o } x - 5 = 0 \\rightarrow \\mathbf{x = 2 \\text{ y } x = 5}"
  }
];

const equationBank = [
  // Ecuaciones Lineales (1 - 10)
  { id: 1, type: "linear", eq: "3x - 5 = 10", solutions: [5], steps: "3x = 15 \\rightarrow x = 5" },
  { id: 2, type: "linear", eq: "2x + 7 = 19", solutions: [6], steps: "2x = 12 \\rightarrow x = 6" },
  { id: 3, type: "linear", eq: "4x - 12 = 16", solutions: [7], steps: "4x = 28 \\rightarrow x = 7" },
  { id: 4, type: "linear", eq: "5x + 3 = -12", solutions: [-3], steps: "5x = -15 \\rightarrow x = -3" },
  { id: 5, type: "linear", eq: "6x - 4 = 2x + 12", solutions: [4], steps: "4x = 16 \\rightarrow x = 4" },
  { id: 6, type: "linear", eq: "7x + 2 = 3x - 14", solutions: [-4], steps: "4x = -16 \\rightarrow x = -4" },
  { id: 7, type: "linear", eq: "2(x + 3) = 22", solutions: [8], steps: "2x + 6 = 22 \\rightarrow 2x = 16 \\rightarrow x = 8" },
  { id: 8, type: "linear", eq: "3(2x - 1) = 15", solutions: [3], steps: "6x - 3 = 15 \\rightarrow 6x = 18 \\rightarrow x = 3" },
  { id: 9, type: "linear", eq: "\\frac{x}{3} + 4 = 7", solutions: [9], steps: "\\frac{x}{3} = 3 \\rightarrow x = 9" },
  { id: 10, type: "linear", eq: "10 - 2x = 14", solutions: [-2], steps: "-2x = 4 \\rightarrow x = -2" },
  // Ecuaciones Cuadráticas (11 - 16)
  { id: 11, type: "quadratic", eq: "x^2 - 5x + 6 = 0", solutions: [2, 3], steps: "(x - 2)(x - 3) = 0 \\rightarrow x = 2, \\, x = 3" },
  { id: 12, type: "quadratic", eq: "x^2 + 4x - 5 = 0", solutions: [-5, 1], steps: "(x + 5)(x - 1) = 0 \\rightarrow x = -5, \\, x = 1" },
  { id: 13, type: "quadratic", eq: "x^2 - 9 = 0", solutions: [-3, 3], steps: "(x - 3)(x + 3) = 0 \\rightarrow x = -3, \\, x = 3" },
  { id: 14, type: "quadratic", eq: "x^2 + 6x + 9 = 0", solutions: [-3, -3], steps: "(x + 3)^2 = 0 \\rightarrow x = -3, \\, x = -3" },
  { id: 15, type: "quadratic", eq: "x^2 - 4x = 0", solutions: [0, 4], steps: "x(x - 4) = 0 \\rightarrow x = 0, \\, x = 4" },
  { id: 16, type: "quadratic", eq: "x^2 + 2x - 8 = 0", solutions: [-4, 2], steps: "(x + 4)(x - 2) = 0 \\rightarrow x = -4, \\, x = 2" }
];

const createEmptySafeInputs = () => ({ x: ['', ''], y: ['', ''], z: ['', ''], w: ['', ''] });

const getSafeSolutions = (equation) => {
  if (equation.type === 'quadratic' && equation.solutions.length === 1) {
    return [equation.solutions[0], equation.solutions[0]];
  }
  return equation.solutions;
};

const isSafeAnswerCorrect = (equation, answers) => {
  if (equation.type !== 'quadratic') {
    const linearAnswer = Number.parseInt(answers[0], 10);
    return !Number.isNaN(linearAnswer) && equation.solutions.includes(linearAnswer);
  }

  const parsedAnswers = answers.map(answer => Number.parseInt(answer, 10));
  if (parsedAnswers.some(Number.isNaN)) return false;

  const [firstSolution, secondSolution] = getSafeSolutions(equation);
  return (parsedAnswers[0] === firstSolution && parsedAnswers[1] === secondSolution)
    || (parsedAnswers[0] === secondSolution && parsedAnswers[1] === firstSolution);
};

const dbPairs = [
  { a: "x^2 + 5x + 6", b: "(x + 2)(x + 3)" },
  { a: "x^2 + 6x + 9", b: "(x + 3)^2" },
  { a: "x^2 - 16", b: "(x - 4)(x + 4)" },
  { a: "4x^2 + 8x", b: "4x(x + 2)" },
  { a: "\\frac{1}{\\sqrt{3}}", b: "\\frac{\\sqrt{3}}{3}" },
  { a: "x^2 - 7x + 12", b: "(x - 3)(x - 4)" },
  { a: "x^2 - 10x + 25", b: "(x - 5)^2" },
  { a: "25x^2 - 49", b: "(5x - 7)(5x + 7)" },
  { a: "6x^3 - 9x^2y", b: "3x^2(2x - 3y)" },
  { a: "\\frac{6}{\\sqrt{2}}", b: "3\\sqrt{2}" },
  { a: "x^2 + 2x - 15", b: "(x + 5)(x - 3)" },
  { a: "4x^2 + 12x + 9", b: "(2x + 3)^2" },
  { a: "81 - x^2", b: "(9 - x)(9 + x)" },
  { a: "15a^2b + 10ab^2", b: "5ab(3a + 2b)" },
  { a: "\\frac{5}{2\\sqrt{5}}", b: "\\frac{\\sqrt{5}}{2}" },
  { a: "x^2 - x - 20", b: "(x - 5)(x + 4)" },
  { a: "x^2 - 14x + 49", b: "(x - 7)^2" },
  { a: "36x^2 - 1", b: "(6x - 1)(6x + 1)" },
  { a: "12x^4y^2 - 18x^3y^3", b: "6x^3y^2(2x - 3y)" },
  { a: "\\frac{4}{\\sqrt{x}}", b: "\\frac{4\\sqrt{x}}{x}" },
  { a: "x^2 + 11x + 30", b: "(x + 5)(x + 6)" },
  { a: "9x^2 - 24x + 16", b: "(3x - 4)^2" },
  { a: "100x^2 - 9y^2", b: "(10x - 3y)(10x + 3y)" },
  { a: "x^3y + x^2y^2 - xy^3", b: "xy(x^2 + xy - y^2)" },
  { a: "\\frac{x}{\\sqrt{x+1}}", b: "\\frac{x\\sqrt{x+1}}{x+1}" },
  { a: "x^4 - 13x^2 + 36", b: "(x - 2)(x + 2)(x - 3)(x + 3)" },
  { a: "x^2 + 2xy + y^2 - 9", b: "(x + y - 3)(x + y + 3)" },
  { a: "x^4 - 81", b: "(x - 3)(x + 3)(x^2 + 9)" },
  { a: "3x(x - 2) + 5(x - 2)", b: "(x - 2)(3x + 5)" },
  { a: "\\frac{2}{\\sqrt{5} - \\sqrt{3}}", b: "\\sqrt{5} + \\sqrt{3}" }
];

const pairColors = ['#f59e0b', '#22d3ee', '#f472b6', '#a3e635', '#c084fc', '#fb7185', '#34d399', '#60a5fa'];

const generateOptions = (correct) => {
  let opts = [correct];
  const isFraction = correct.includes("\\frac");
  
  if (isFraction) {
    let nums = correct.match(/\d+/g);
    if (nums && nums.length >= 2) {
      opts.push(`\\frac{${nums[1]}}{${nums[0]}}`);
      opts.push(`\\frac{${parseInt(nums[0]) + 1}}{${nums[1]}}`);
      opts.push(`\\frac{${nums[0]}}{${parseInt(nums[1]) + 1}}`);
    } else {
      opts.push("1", "0", "-1");
    }
  } else {
    let num = parseInt(correct);
    if (!isNaN(num)) {
      opts.push((num + 2).toString(), (num - 1).toString(), (num === 0) ? "1" : (-num).toString());
    } else {
      opts.push("0", "1", "-1");
    }
  }
  
  opts = Array.from(new Set(opts));
  while (opts.length < 4) {
    opts.push(Math.floor(Math.random() * 20).toString());
    opts = Array.from(new Set(opts));
  }
  return opts.sort(() => 0.5 - Math.random());
};
// ================= DATOS TEMA 4: PLANO CARTESIANO =================
const coworkingQuestions = [
  {
    id: 1,
    title: "Subpregunta 1: Ubicación - Puntos y Cuadrantes",
    desc: "El plano del café coworking se ubica sobre un plano cartesiano (en metros) con origen (0,0) en el centro del salón. Si la caja registradora está en A(-3, 5) y la barra de café en B(1, -3), ¿en qué cuadrante se encuentra cada punto?",
    options: [
      "\\text{A en el Cuadrante I y B en el Cuadrante III}",
      "\\text{A en el Cuadrante II y B en el Cuadrante IV}",
      "\\text{A en el Cuadrante II y B en el Cuadrante III}",
      "\\text{A en el Cuadrante IV y B en el Cuadrante II}"
    ],
    correct: "\\text{A en el Cuadrante II y B en el Cuadrante IV}",
    solution: "A(-3, 5) \\text{ tiene } x < 0, y > 0 \\text{ (Cuadrante II)}; \\quad B(1, -3) \\text{ tiene } x > 0, y < 0 \\text{ (Cuadrante IV)}."
  },
  {
    id: 2,
    title: "Subpregunta 2: Cableado de Red - Ecuación de la Recta",
    desc: "Se tenderá un cable en línea recta desde la caja registradora A(-3, 5) hasta la barra de café B(1, -3). Halla la ecuación de la recta (y = mx + b) que representa el recorrido del cable.",
    options: [
      "y = 2x + 11",
      "y = -2x + 1",
      "y = -2x - 1",
      "y = -\\frac{1}{2}x + \\frac{7}{2}"
    ],
    correct: "y = -2x - 1",
    solution: "m = \\frac{-3 - 5}{1 - (-3)} = \\frac{-8}{4} = -2 \\;\\Rightarrow\\; y - 5 = -2(x + 3) \\;\\Rightarrow\\; \\mathbf{y = -2x - 1}"
  },
  {
    id: 3,
    title: "Subpregunta 3: Cobertura Wi-Fi - Ecuación de la Circunferencia",
    desc: "Se instala un router principal en el punto C(2, 1) con un alcance circular de 5 metros de radio. Escribe la ecuación ordinaria de la circunferencia que delimita su zona de cobertura.",
    options: [
      "(x + 2)^2 + (y + 1)^2 = 25",
      "(x - 2)^2 + (y - 1)^2 = 5",
      "(x - 1)^2 + (y - 2)^2 = 25",
      "(x - 2)^2 + (y - 1)^2 = 25"
    ],
    correct: "(x - 2)^2 + (y - 1)^2 = 25",
    solution: "(x - h)^2 + (y - k)^2 = r^2 \\;\\text{ con } (h, k) = (2, 1) \\text{ y } r = 5 \\;\\Rightarrow\\; \\mathbf{(x - 2)^2 + (y - 1)^2 = 25}"
  }
];

const createEmptyAlienInputs = () => ({
  m: '', b: '',
  h: '', k: '', r: '',
  p1p2_m: '', p1p2_b: '',
  p2p3_m: '', p2p3_b: '',
  p3p1_m: '', p3p1_b: ''
});

const alienBankLevel1 = [
  { id: 1, points: [{ label: "A", x: -4, y: -3 }, { label: "B", x: 0, y: -1 }, { label: "C", x: 4, y: 1 }], m: 0.5, b: -1, eqText: "y = \\frac{1}{2}x - 1" },
  { id: 2, points: [{ label: "A", x: -3, y: 4 }, { label: "B", x: 0, y: 1 }, { label: "C", x: 3, y: -2 }], m: -1, b: 1, eqText: "y = -x + 1" },
  { id: 3, points: [{ label: "A", x: -2, y: -5 }, { label: "B", x: 1, y: 1 }, { label: "C", x: 3, y: 5 }], m: 2, b: -1, eqText: "y = 2x - 1" },
  { id: 4, points: [{ label: "A", x: -5, y: 2 }, { label: "B", x: 0, y: 2 }, { label: "C", x: 5, y: 2 }], m: 0, b: 2, eqText: "y = 2" },
  { id: 5, points: [{ label: "A", x: -1, y: -4 }, { label: "B", x: 1, y: 0 }, { label: "C", x: 3, y: 4 }], m: 2, b: -2, eqText: "y = 2x - 2" }
];

const alienBankLevel2 = [
  { id: 1, points: [{ label: "A", x: -3, y: 4 }, { label: "B", x: 0, y: 5 }, { label: "C", x: 3, y: -4 }], h: 0, k: 0, r: 5, eqText: "x^2 + y^2 = 25" },
  { id: 2, points: [{ label: "A", x: 5, y: -1 }, { label: "B", x: -3, y: -1 }, { label: "C", x: 1, y: 3 }], h: 1, k: -1, r: 4, eqText: "(x - 1)^2 + (y + 1)^2 = 16" },
  { id: 3, points: [{ label: "A", x: 1, y: 1 }, { label: "B", x: -5, y: 1 }, { label: "C", x: -2, y: 4 }], h: -2, k: 1, r: 3, eqText: "(x + 2)^2 + (y - 1)^2 = 9" },
  { id: 4, points: [{ label: "A", x: 0, y: 5 }, { label: "B", x: 4, y: 1 }, { label: "C", x: -4, y: 1 }], h: 0, k: 1, r: 4, eqText: "x^2 + (y - 1)^2 = 16" },
  { id: 5, points: [{ label: "A", x: 2, y: 3 }, { label: "B", x: -4, y: 3 }, { label: "C", x: 3, y: -4 }], h: -1, k: -1, r: 5, eqText: "(x + 1)^2 + (y + 1)^2 = 25" }
];

const alienBankLevel3 = [
  {
    id: 1,
    points: [
      { label: "MARCIAJUANJO", short: "P₁", x: -2, y: -4 },
      { label: "ALIENIJUANJO", short: "P₂", x: 2, y: 4 },
      { label: "EXTRATERREJUANJO", short: "P₃", x: 5, y: -2 }
    ],
    segments: [
      { key: "p1p2", title: "Recta P₁P₂ (MARCIAJUANJO - ALIENIJUANJO)", m: 2, b: 0, eqText: "m = 2, \\; b = 0" },
      { key: "p2p3", title: "Recta P₂P₃ (ALIENIJUANJO - EXTRATERREJUANJO)", m: -2, b: 8, eqText: "m = -2, \\; b = 8" },
      { key: "p3p1", title: "Recta P₃P₁ (EXTRATERREJUANJO - MARCIAJUANJO)", m: 2 / 7, b: -24 / 7, eqText: "m = \\frac{2}{7}, \\; b = -\\frac{24}{7}" }
    ]
  },
  {
    id: 2,
    points: [
      { label: "MARCIAJUANJO", short: "P₁", x: -4, y: 1 },
      { label: "ALIENIJUANJO", short: "P₂", x: 0, y: 5 },
      { label: "EXTRATERREJUANJO", short: "P₃", x: 3, y: -1 }
    ],
    segments: [
      { key: "p1p2", title: "Recta P₁P₂ (MARCIAJUANJO - ALIENIJUANJO)", m: 1, b: 5, eqText: "m = 1, \\; b = 5" },
      { key: "p2p3", title: "Recta P₂P₃ (ALIENIJUANJO - EXTRATERREJUANJO)", m: -2, b: 5, eqText: "m = -2, \\; b = 5" },
      { key: "p3p1", title: "Recta P₃P₁ (EXTRATERREJUANJO - MARCIAJUANJO)", m: -2 / 7, b: -1 / 7, eqText: "m = -\\frac{2}{7}, \\; b = -\\frac{1}{7}" }
    ]
  },
  {
    id: 3,
    points: [
      { label: "MARCIAJUANJO", short: "P₁", x: -3, y: 3 },
      { label: "ALIENIJUANJO", short: "P₂", x: 1, y: -1 },
      { label: "EXTRATERREJUANJO", short: "P₃", x: -1, y: -5 }
    ],
    segments: [
      { key: "p1p2", title: "Recta P₁P₂ (MARCIAJUANJO - ALIENIJUANJO)", m: -1, b: 0, eqText: "m = -1, \\; b = 0" },
      { key: "p2p3", title: "Recta P₂P₃ (ALIENIJUANJO - EXTRATERREJUANJO)", m: 2, b: -3, eqText: "m = 2, \\; b = -3" },
      { key: "p3p1", title: "Recta P₃P₁ (EXTRATERREJUANJO - MARCIAJUANJO)", m: -4, b: -9, eqText: "m = -4, \\; b = -9" }
    ]
  },
  {
    id: 4,
    points: [
      { label: "MARCIAJUANJO", short: "P₁", x: -5, y: 0 },
      { label: "ALIENIJUANJO", short: "P₂", x: 1, y: 3 },
      { label: "EXTRATERREJUANJO", short: "P₃", x: 4, y: -3 }
    ],
    segments: [
      { key: "p1p2", title: "Recta P₁P₂ (MARCIAJUANJO - ALIENIJUANJO)", m: 0.5, b: 2.5, eqText: "m = \\frac{1}{2}, \\; b = \\frac{5}{2}" },
      { key: "p2p3", title: "Recta P₂P₃ (ALIENIJUANJO - EXTRATERREJUANJO)", m: -2, b: 5, eqText: "m = -2, \\; b = 5" },
      { key: "p3p1", title: "Recta P₃P₁ (EXTRATERREJUANJO - MARCIAJUANJO)", m: -1 / 3, b: -5 / 3, eqText: "m = -\\frac{1}{3}, \\; b = -\\frac{5}{3}" }
    ]
  },
  {
    id: 5,
    points: [
      { label: "MARCIAJUANJO", short: "P₁", x: -2, y: 5 },
      { label: "ALIENIJUANJO", short: "P₂", x: 2, y: -3 },
      { label: "EXTRATERREJUANJO", short: "P₃", x: -4, y: -1 }
    ],
    segments: [
      { key: "p1p2", title: "Recta P₁P₂ (MARCIAJUANJO - ALIENIJUANJO)", m: -2, b: 1, eqText: "m = -2, \\; b = 1" },
      { key: "p2p3", title: "Recta P₂P₃ (ALIENIJUANJO - EXTRATERREJUANJO)", m: -1 / 3, b: -7 / 3, eqText: "m = -\\frac{1}{3}, \\; b = -\\frac{7}{3}" },
      { key: "p3p1", title: "Recta P₃P₁ (EXTRATERREJUANJO - MARCIAJUANJO)", m: 3, b: 11, eqText: "m = 3, \\; b = 11" }
    ]
  }
];

// Evalúa entradas enteras, decimales o fracciones (ej. "1/2", "-24/7", "0.5")
const parseMathValue = (raw) => {
  if (raw === null || raw === undefined) return NaN;
  const cleaned = String(raw).trim().replace(',', '.').replace(/\s+/g, '');
  if (!cleaned) return NaN;
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length !== 2) return NaN;
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return NaN;
    return num / den;
  }
  const val = Number(cleaned);
  return Number.isFinite(val) ? val : NaN;
};

const isWithinTolerance = (val, target, tol = 0.01) => !Number.isNaN(val) && Math.abs(val - target) <= tol;
// Generador de sonidos nativos usando Web Audio API
// Sintetizador de sonidos espaciales (Web Audio API) para Unidad Antialienígena
const playSpaceSound = (type, isMuted = false) => {
  if (isMuted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  if (type === 'laser') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } else if (type === 'explosion') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.46);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } else if (type === 'miss') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(135, ctx.currentTime + 0.32);
    gain.gain.setValueAtTime(0.11, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.33);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.33);
  } else if (type === 'victory') {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.13;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }
};

const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'beep') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'go') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'correct') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }
};

export default function App() {
// --- SISTEMA DE USUARIOS Y FIREBASE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Estados para Formulario de Acceso
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ nombre: '', correo: '', password: '', grupo: '' });
  const [authError, setAuthError] = useState('');

  // Estados para Top Grupo y Panel Admin
  const [showTopGroup, setShowTopGroup] = useState(false);
  const [topGroupData, setTopGroupData] = useState([]);
  const [topGroupError, setTopGroupError] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminError, setAdminError] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminGroupFilter, setAdminGroupFilter] = useState('');

  // 1. Persistencia de Sesión
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ uid: user.uid, ...userData });
          setAttempts(Number(userData.intentosCarrera || 0));
          setPairsAttempts(Number(userData.intentosParejas || 0));
          await updateDoc(doc(db, 'usuarios', user.uid), {
            enLinea: true,
            ultimoLogin: serverTimestamp()
          }).catch(() => {});
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Contador de Tiempo (cada 60s) y Estado en Línea
  useEffect(() => {
    if (!firebaseConfigured || !currentUser?.uid || currentUser.isGuest || isAdmin) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateDoc(doc(db, 'usuarios', currentUser.uid), {
          tiempoTotalSegundos: increment(60)
        }).catch(() => {});
      }
    }, 60000);

    const handleUnload = () => {
      updateDoc(doc(db, 'usuarios', currentUser.uid), { enLinea: false }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.uid, currentUser?.isGuest, isAdmin]);

  // 3. Ranking Top Grupo en Tiempo Real
  useEffect(() => {
    if (!firebaseConfigured || !showTopGroup || !currentUser?.grupo || currentUser?.isGuest) return;
    const q = query(
      collection(db, 'usuarios'),
      where('grupo', '==', Number(currentUser.grupo)),
      orderBy('puntos', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTopGroupError('');
      const users = [];
      snapshot.forEach((d) => users.push({ id: d.id, ...d.data() }));
      setTopGroupData(users);
    }, (err) => {
      setTopGroupError('Error al cargar el ranking (verifica índices o permisos de Firestore).');
      console.error(err);
    });
    return () => unsub();
  }, [showTopGroup, currentUser?.grupo, currentUser?.isGuest]);

  // 4. Panel de Administrador en Tiempo Real
  useEffect(() => {
    if (!firebaseConfigured || !isAdmin) return;
    const q = query(collection(db, 'usuarios'), orderBy('puntos', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAdminError('');
      const users = [];
      snapshot.forEach((d) => users.push({ id: d.id, ...d.data() }));
      setAdminUsers(users);
    }, (err) => {
      setAdminError('Sin permisos en Firestore para listar todos los estudiantes. Ajusta tus reglas de seguridad.');
      console.error(err);
    });
    return () => unsub();
  }, [isAdmin]);

  // Función Segura de Puntos (con transacción anti-duplicados)
  const addPointsToUser = async (pointsToAdd, gameId = null) => {
    if (currentUser?.isGuest) {
      if (gameId && currentUser.juegosJugados?.includes(gameId)) return false;
      setCurrentUser(prev => ({
        ...prev,
        puntos: (prev.puntos || 0) + pointsToAdd,
        juegosJugados: gameId ? Array.from(new Set([...(prev.juegosJugados || []), gameId])) : prev.juegosJugados
      }));
      return true;
    }

    if (!firebaseConfigured || !currentUser?.uid || isAdmin) return false;
    if (gameId && currentUser.juegosJugados?.includes(gameId)) return false;

    try {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      const transactionSuccess = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(userRef);
        if (!snap.exists()) return false;
        const data = snap.data();
        const jugados = data.juegosJugados || [];
        if (gameId && jugados.includes(gameId)) return false;

        const updates = {};
        if (pointsToAdd > 0) updates.puntos = increment(pointsToAdd);
        if (gameId) updates.juegosJugados = arrayUnion(gameId);

        if (Object.keys(updates).length > 0) {
          transaction.update(userRef, updates);
        }
        return true;
      });

      if (transactionSuccess) {
        setCurrentUser((prev) => ({
          ...prev,
          puntos: (prev.puntos || 0) + pointsToAdd,
          juegosJugados: gameId ? Array.from(new Set([...(prev.juegosJugados || []), gameId])) : prev.juegosJugados
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error guardando puntos en Firestore:', e);
      return false;
    }
  };

  // Registrar intento de Carrera
  const registerAttempt = async () => {
    if (currentUser?.isGuest) return;
    if (!firebaseConfigured || !currentUser?.uid || isAdmin) return;
    updateDoc(doc(db, 'usuarios', currentUser.uid), {
      intentosCarrera: increment(1)
    }).catch(() => {});
  };

  // Entrar como Invitado (sin guardar progreso en base de datos)
  const handleGuestLogin = () => {
    setCurrentUser({
      nombre: 'Invitado',
      correo: 'invitado@local',
      grupo: null,
      puntos: 0,
      juegosJugados: [],
      intentosCarrera: 0,
      intentosParejas: 0,
      isGuest: true
    });
    setAttempts(0);
    setPairsAttempts(0);
    setAuthError('');
    setHuertoStep(0);
    setHuertoSelections({});
    setPairsState('start');
    setFoodTruckStep(0);
    setFoodTruckSelections({});
    setSafeState('start');
  };

  // Inicio de Sesión / Registro Firebase
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!firebaseConfigured) {
      setAuthError('Firebase no está configurado. Revisa tu archivo .env.local');
      return;
    }
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, authForm.correo, authForm.password);
        const newUser = {
          nombre: authForm.nombre.trim(),
          correo: authForm.correo.trim(),
          grupo: Number(authForm.grupo),
          puntos: 0,
          juegosJugados: [],
          intentosCarrera: 0,
          intentosParejas: 0,
          ultimoLogin: serverTimestamp(),
          enLinea: true,
          tiempoTotalSegundos: 0
        };
        await setDoc(doc(db, 'usuarios', userCred.user.uid), newUser);
      } else {
        await signInWithEmailAndPassword(auth, authForm.correo, authForm.password);
      }
      // Resetear estados locales de juegos
      setHuertoStep(0);
      setHuertoSelections({});
      setPairsState('start');
      setFoodTruckStep(0);
      setFoodTruckSelections({});
      setSafeState('start');
    } catch (error) {
      setAuthError('Error de acceso: verifica tu correo, contraseña (mín. 6 caracteres) o si el correo ya existe.');
    }
  };

  // Cerrar Sesión
  const handleLogout = async () => {
    if (!currentUser?.isGuest && firebaseConfigured && currentUser?.uid) {
      await updateDoc(doc(db, 'usuarios', currentUser.uid), { enLinea: false }).catch(() => {});
      await signOut(auth).catch(() => {});
    }
    setCurrentUser(null);
    setIsAdmin(false);
    setShowTopGroup(false);
    setAttempts(0);
    setQuizState('start');
    setMotSelection(null);
    setScore(0);
    setPairsAttempts(0);
    setPairsState('start');
    setHuertoStep(0);
    setHuertoSelections({});
    setFoodTruckStep(0);
    setFoodTruckSelections({});
    setSafeState('start');
  };

  const [activeTab, setActiveTab] = useState('tema1');
  const [activeSubTab, setActiveSubTab] = useState('suma');
  const [motSelection, setMotSelection] = useState(null);
  const [quizState, setQuizState] = useState('start');
  const [countdownNum, setCountdownNum] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [options, setOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isScoringAttempt, setIsScoringAttempt] = useState(false);
  const [huertoStep, setHuertoStep] = useState(0);
  const [huertoSelections, setHuertoSelections] = useState({});
  const [pairsState, setPairsState] = useState('start');
  const [pairsTimer, setPairsTimer] = useState(600);
  const [leftList, setLeftList] = useState([]);
  const [rightList, setRightList] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [userMatches, setUserMatches] = useState({});
  const [pairsScore, setPairsScore] = useState(0);
  const [pairsAttempts, setPairsAttempts] = useState(0);
  const [tema2SubTab, setTema2SubTab] = useState('factorComun');
  const [foodTruckStep, setFoodTruckStep] = useState(0);
  const [foodTruckSelections, setFoodTruckSelections] = useState({});
  const [safeState, setSafeState] = useState('start');
  const [safeTimer, setSafeTimer] = useState(600);
  const [safeEqs, setSafeEqs] = useState([]);
  const [safeInputs, setSafeInputs] = useState(createEmptySafeInputs);
  const [safeAttemptsCount, setSafeAttemptsCount] = useState(0);
  const [safeScore, setSafeScore] = useState(0);
  const [safeReviewTab, setSafeReviewTab] = useState('banco');
  const [safeBankFilter, setSafeBankFilter] = useState('lineales');
  const [coworkingStep, setCoworkingStep] = useState(0);
  const [coworkingSelections, setCoworkingSelections] = useState({});
  const [alienState, setAlienState] = useState('start');
  const [alienMuted, setAlienMuted] = useState(false);
  const [alienLevel, setAlienLevel] = useState(1);
  const [alienScenarios, setAlienScenarios] = useState({ 1: null, 2: null, 3: null });
  const [alienInputs, setAlienInputs] = useState(createEmptyAlienInputs);
  const [alienAttempts, setAlienAttempts] = useState({ 1: 0, 2: 0, 3: 0 });
  const [alienLevelCleared, setAlienLevelCleared] = useState(false);
  const [alienLastShot, setAlienLastShot] = useState(null);
  const [alienInputError, setAlienInputError] = useState('');
  const [alienHistory, setAlienHistory] = useState([]);
  const [tema4ReviewTab, setTema4ReviewTab] = useState('recta');

  useEffect(() => {
    setAttempts(Number(currentUser?.intentosCarrera || 0));
    setPairsAttempts(Number(currentUser?.intentosParejas || 0));
  }, [currentUser?.uid, currentUser?.intentosCarrera, currentUser?.intentosParejas]);

  // Temporizador de preguntas
  useEffect(() => {
    let timer;
    if (quizState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && quizState === 'playing') {
      handleAnswer(false);
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const startCountdownSequence = () => {
    setQuizState('countdown');
    let count = 3;
    setCountdownNum(count);
    playSound('beep');

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        playSound('beep');
      } else if (count === 0) {
        setCountdownNum('¡FUERA!');
        playSound('go');
      } else {
        clearInterval(interval);
        startQuiz();
      }
    }, 1000);
  };

  const startQuiz = () => {
    const selected = [...dbQuestions].sort(() => 0.5 - Math.random()).slice(0, 20);
    setQuestions(selected);
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(20);
    setOptions(generateOptions(selected[0].a));
    
    setIsScoringAttempt(!currentUser?.juegosJugados?.includes('carrera'));
    registerAttempt();
    
    setQuizState('playing');
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    
    if (currentQ + 1 < 20) {
      setCurrentQ(prev => prev + 1);
      setOptions(generateOptions(questions[currentQ + 1].a));
      setTimeLeft(20);
    } else {
      setQuizState('finished');
      if (isScoringAttempt) addPointsToUser(score + (isCorrect ? 1 : 0), 'carrera');
    }
  };

  const startPairsGame = () => {
    const selected = [...dbPairs].sort(() => 0.5 - Math.random()).slice(0, 8);
    const left = [];
    const right = [];

    selected.forEach((pair, index) => {
      const swap = Math.random() > 0.5;
      left.push({ pairId: index, expr: swap ? pair.b : pair.a });
      right.push({ pairId: index, expr: swap ? pair.a : pair.b });
    });

    setLeftList(left.sort(() => 0.5 - Math.random()));
    setRightList(right.sort(() => 0.5 - Math.random()));
    setSelectedLeft(null);
    setUserMatches({});
    setPairsTimer(600);
    setPairsScore(0);
    setPairsState('playing');
  };

  const finishPairsGame = () => {
    if (pairsState !== 'playing') return;

    const correctCount = leftList.reduce((total, item, leftIndex) => {
      const rightIndex = userMatches[leftIndex];
      return rightIndex !== undefined && item.pairId === rightList[rightIndex].pairId ? total + 1 : total;
    }, 0);

    setPairsScore(correctCount);
    setPairsState('finished');

    if (pairsAttempts === 0) addPointsToUser(correctCount * 2, 'parejas');
    if (!currentUser?.isGuest && currentUser?.uid && db) {
      updateDoc(doc(db, 'usuarios', currentUser.uid), { intentosParejas: increment(1) })
        .then(() => setCurrentUser(previous => ({ ...previous, intentosParejas: (previous?.intentosParejas || 0) + 1 })))
        .catch(error => console.error('Error registrando intento de parejas:', error));
    }
    setPairsAttempts(prev => prev + 1);
  };

  const handleSelectLeft = (index) => {
    if (userMatches[index] === undefined) setSelectedLeft(index);
  };

  const handleSelectRight = (index) => {
    if (selectedLeft === null || Object.values(userMatches).includes(index)) return;
    setUserMatches(prev => ({ ...prev, [selectedLeft]: index }));
    setSelectedLeft(null);
  };

  useEffect(() => {
    let timer;
    if (pairsState === 'playing' && pairsTimer > 0) {
      timer = setInterval(() => setPairsTimer(prev => prev - 1), 1000);
    } else if (pairsState === 'playing' && pairsTimer === 0) {
      finishPairsGame();
    }
    return () => clearInterval(timer);
  }, [pairsState, pairsTimer]);

  const startSafeGame = () => {
    const numberOfQuadratics = Math.floor(Math.random() * 2) + 1;
    const numberOfLinears = 4 - numberOfQuadratics;
    const quadratics = [...equationBank.filter(equation => equation.type === 'quadratic')]
      .sort(() => 0.5 - Math.random())
      .slice(0, numberOfQuadratics);
    const linears = [...equationBank.filter(equation => equation.type === 'linear')]
      .sort(() => 0.5 - Math.random())
      .slice(0, numberOfLinears);
    const variables = ['x', 'y', 'z', 'w'];
    const selectedEquations = [...quadratics, ...linears]
      .sort(() => 0.5 - Math.random())
      .map((equation, index) => ({
        ...equation,
        varName: variables[index],
        displayEq: equation.eq.replace(/x/g, variables[index])
      }));

    setSafeEqs(selectedEquations);
    setSafeInputs(createEmptySafeInputs());
    setSafeAttemptsCount(0);
    setSafeScore(0);
    setSafeTimer(600);
    setSafeState('playing');
  };

  const handleSafeAttempt = async (isManualFinish = false) => {
    if (safeState !== 'playing') return;

    const attemptNumber = safeAttemptsCount + 1;
    const correctCount = safeEqs.filter(equation => isSafeAnswerCorrect(equation, safeInputs[equation.varName])).length;
    const firstAttemptReward = attemptNumber === 1
      ? await addPointsToUser(correctCount === safeEqs.length ? 4 : 0, 'cajafuerte')
      : false;

    setSafeAttemptsCount(attemptNumber);
    if (correctCount === safeEqs.length) {
      playSound('correct');
      const pointsWon = firstAttemptReward ? 4 : 0;
      setSafeScore(pointsWon);
      setSafeState('finished');
    } else {
      playSound('wrong');
      if (isManualFinish) {
        setSafeScore(0);
        setSafeState('finished');
      }
    }
  };

  useEffect(() => {
    let timer;
    if (safeState === 'playing' && safeTimer > 0) {
      timer = setInterval(() => setSafeTimer(prev => prev - 1), 1000);
    } else if (safeState === 'playing' && safeTimer === 0) {
      handleSafeAttempt(true);
    }
    return () => clearInterval(timer);
  }, [safeState, safeTimer]);

  const startAlienMission = () => {
    setAlienScenarios({
      1: alienBankLevel1[Math.floor(Math.random() * alienBankLevel1.length)],
      2: alienBankLevel2[Math.floor(Math.random() * alienBankLevel2.length)],
      3: alienBankLevel3[Math.floor(Math.random() * alienBankLevel3.length)]
    });
    setAlienLevel(1);
    setAlienAttempts({ 1: 0, 2: 0, 3: 0 });
    setAlienLevelCleared(false);
    setAlienLastShot(null);
    setAlienInputError('');
    setAlienHistory([]);
    setAlienInputs(createEmptyAlienInputs());
    setAlienState('playing');
  };

  const handleAlienFire = () => {
    if (alienLevelCleared) return;
    setAlienInputError('');

    const scenario = alienScenarios[alienLevel];
    if (!scenario) return;
    const currentAttempt = alienAttempts[alienLevel] + 1;

    if (alienLevel === 1) {
      const slope = parseMathValue(alienInputs.m);
      const intercept = parseMathValue(alienInputs.b);
      if (Number.isNaN(slope) || Number.isNaN(intercept)) {
        setAlienInputError('Ingresa valores numéricos válidos o fracciones (ej. 1/2, -2) para m y b.');
        return;
      }

      playSpaceSound('laser', alienMuted);
      setAlienAttempts(prev => ({ ...prev, 1: currentAttempt }));
      const hit = isWithinTolerance(slope, scenario.m) && isWithinTolerance(intercept, scenario.b);
      setAlienLastShot({ type: 'line', m: slope, b: intercept, hit });

      if (hit) {
        setAlienLevelCleared(true);
        setAlienHistory(prev => [
          ...prev.filter(item => item.level !== 1),
          { level: 1, title: 'Nivel 1: Rayo Lineal', earned: currentAttempt === 1 ? 1 : 0, firstTry: currentAttempt === 1, status: 'Destruidos', solution: scenario.eqText }
        ]);
        setTimeout(() => playSpaceSound('explosion', alienMuted), 180);
      } else {
        setTimeout(() => playSpaceSound('miss', alienMuted), 180);
      }
      return;
    }

    if (alienLevel === 2) {
      const centerX = parseMathValue(alienInputs.h);
      const centerY = parseMathValue(alienInputs.k);
      const radius = parseMathValue(alienInputs.r);
      if ([centerX, centerY, radius].some(Number.isNaN) || radius <= 0) {
        setAlienInputError('Ingresa valores válidos para h, k y un radio r mayor que 0.');
        return;
      }

      playSpaceSound('laser', alienMuted);
      setAlienAttempts(prev => ({ ...prev, 2: currentAttempt }));
      const hit = isWithinTolerance(centerX, scenario.h)
        && isWithinTolerance(centerY, scenario.k)
        && isWithinTolerance(radius, scenario.r);
      setAlienLastShot({ type: 'circle', h: centerX, k: centerY, r: radius, hit });

      if (hit) {
        setAlienLevelCleared(true);
        setAlienHistory(prev => [
          ...prev.filter(item => item.level !== 2),
          { level: 2, title: 'Nivel 2: Onda Expansiva Circular', earned: currentAttempt === 1 ? 1 : 0, firstTry: currentAttempt === 1, status: 'Destruidos', solution: scenario.eqText }
        ]);
        setTimeout(() => playSpaceSound('explosion', alienMuted), 180);
      } else {
        setTimeout(() => playSpaceSound('miss', alienMuted), 180);
      }
      return;
    }

    const enteredLines = scenario.segments.map(segment => ({
      ...segment,
      enteredSlope: parseMathValue(alienInputs[`${segment.key}_m`]),
      enteredIntercept: parseMathValue(alienInputs[`${segment.key}_b`])
    }));
    if (enteredLines.some(line => Number.isNaN(line.enteredSlope) || Number.isNaN(line.enteredIntercept))) {
      setAlienInputError('Completa m y b con números o fracciones válidas (ej. -24/7) para las 3 rectas.');
      return;
    }

    playSpaceSound('laser', alienMuted);
    setAlienAttempts(prev => ({ ...prev, 3: currentAttempt }));
    const evaluatedLines = enteredLines.map(line => ({
      ...line,
      hit: isWithinTolerance(line.enteredSlope, line.m) && isWithinTolerance(line.enteredIntercept, line.b)
    }));
    const hit = evaluatedLines.every(line => line.hit);
    setAlienLastShot({ type: 'triangle', lines: evaluatedLines, hit });

    if (hit) {
      const solution = scenario.segments.map(segment => `${segment.key.toUpperCase()}: (${segment.eqText})`).join(' \\;|\\; ');
      setAlienLevelCleared(true);
      setAlienHistory(prev => [
        ...prev.filter(item => item.level !== 3),
        { level: 3, title: 'Nivel 3: Triangulación Orbital', earned: currentAttempt === 1 ? 1 : 0, firstTry: currentAttempt === 1, status: 'Destruidos', solution }
      ]);
      setTimeout(() => playSpaceSound('victory', alienMuted), 180);
    } else {
      setTimeout(() => playSpaceSound('miss', alienMuted), 180);
    }
  };

  const handleAlienAdvanceOrSkip = async (skipped = false) => {
    let updatedHistory = [...alienHistory];

    if (skipped) {
      const scenario = alienScenarios[alienLevel];
      const titles = {
        1: 'Nivel 1: Rayo Lineal',
        2: 'Nivel 2: Onda Expansiva Circular',
        3: 'Nivel 3: Triangulación Orbital'
      };
      const solution = alienLevel === 3
        ? scenario.segments.map(segment => `${segment.key.toUpperCase()}: (${segment.eqText})`).join(' \\;|\\; ')
        : scenario.eqText;
      updatedHistory = [
        ...updatedHistory.filter(item => item.level !== alienLevel),
        { level: alienLevel, title: titles[alienLevel], earned: 0, firstTry: false, status: 'Omitido / Sin destruir', solution }
      ];
      setAlienHistory(updatedHistory);
    }

    if (alienLevel < 3) {
      setAlienLevel(prev => prev + 1);
      setAlienLevelCleared(false);
      setAlienLastShot(null);
      setAlienInputError('');
      return;
    }

    const earned = updatedHistory.reduce((total, item) => total + item.earned, 0);
    const pointsAwarded = await addPointsToUser(earned, 'mision-alienigena');
    if (earned > 0 && !pointsAwarded) {
      updatedHistory = updatedHistory.map(item => ({ ...item, earned: 0 }));
      setAlienHistory(updatedHistory);
    }
    setAlienState('finished');
  };

  const renderCartesianRadar = () => {
    const scenario = alienScenarios[alienLevel];
    if (!scenario) return null;

    const size = 460;
    const padding = 32;
    const plotSize = size - padding * 2;
    const minimum = -7;
    const maximum = 7;
    const scale = plotSize / (maximum - minimum);
    const toX = (value) => padding + (value - minimum) * scale;
    const toY = (value) => padding + (maximum - value) * scale;
    const ticks = Array.from({ length: 15 }, (_, index) => index - 7);

    return (
      <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] max-w-[490px] w-full mx-auto">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto select-none" role="img" aria-label="Radar del plano cartesiano">
          <defs>
            <clipPath id="alien-radar-clip"><rect x={padding - 4} y={padding - 4} width={plotSize + 8} height={plotSize + 8} rx="6" /></clipPath>
          </defs>
          <rect x={padding} y={padding} width={plotSize} height={plotSize} fill="#060d1f" stroke="#1e293b" strokeWidth="1.5" />
          {ticks.map(tick => (
            <g key={tick}>
              <line x1={toX(tick)} y1={padding} x2={toX(tick)} y2={size - padding} stroke={tick === 0 ? '#38bdf8' : '#1e293b'} strokeWidth={tick === 0 ? 2 : 1} />
              <line x1={padding} y1={toY(tick)} x2={size - padding} y2={toY(tick)} stroke={tick === 0 ? '#38bdf8' : '#1e293b'} strokeWidth={tick === 0 ? 2 : 1} />
              {tick !== 0 && (
                <>
                  <text x={toX(tick)} y={toY(0) + 14} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">{tick}</text>
                  <text x={toX(0) - 9} y={toY(tick) + 3.5} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{tick}</text>
                </>
              )}
            </g>
          ))}
          <text x={size - padding + 12} y={toY(0) + 4} fill="#38bdf8" fontSize="12" fontWeight="900">X</text>
          <text x={toX(0)} y={padding - 10} fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle">Y</text>
          <text x={toX(0) - 8} y={toY(0) + 13} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">0</text>

          <g clipPath="url(#alien-radar-clip)">
            {alienLastShot?.type === 'line' && (
              <line x1={toX(-7.5)} y1={toY(alienLastShot.m * -7.5 + alienLastShot.b)} x2={toX(7.5)} y2={toY(alienLastShot.m * 7.5 + alienLastShot.b)} stroke={alienLastShot.hit ? '#10b981' : '#f43f5e'} strokeWidth="4" strokeDasharray={alienLastShot.hit ? undefined : '8 6'} strokeLinecap="round" />
            )}
            {alienLastShot?.type === 'circle' && (
              <g>
                <circle cx={toX(alienLastShot.h)} cy={toY(alienLastShot.k)} r={alienLastShot.r * scale} fill={alienLastShot.hit ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'} stroke={alienLastShot.hit ? '#10b981' : '#f43f5e'} strokeWidth="3.5" strokeDasharray={alienLastShot.hit ? undefined : '8 6'} />
                <circle cx={toX(alienLastShot.h)} cy={toY(alienLastShot.k)} r="4" fill="#fbbf24" />
              </g>
            )}
            {alienLastShot?.type === 'triangle' && alienLastShot.lines.map(line => (
              <line key={line.key} x1={toX(-7.5)} y1={toY(line.enteredSlope * -7.5 + line.enteredIntercept)} x2={toX(7.5)} y2={toY(line.enteredSlope * 7.5 + line.enteredIntercept)} stroke={line.hit ? '#10b981' : '#f43f5e'} strokeWidth="3.5" strokeDasharray={line.hit ? undefined : '7 5'} strokeLinecap="round" />
            ))}
          </g>

          {scenario.points.map((point, index) => {
            const centerX = toX(point.x);
            const centerY = toY(point.y);
            const label = point.short ? `${point.label} (${point.x}, ${point.y})` : `${point.label} (${point.x}, ${point.y})`;
            const labelWidth = label.length * 6.2 + 12;
            const offsetY = point.y >= 5.5 ? 24 : -16;
            return (
              <g key={`${point.label}-${index}`}>
                <g transform={`translate(${centerX}, ${centerY})`}>
                  <circle r="13" fill={alienLevelCleared ? 'rgba(16,185,129,0.22)' : 'rgba(168,85,247,0.25)'} stroke={alienLevelCleared ? '#10b981' : '#c084fc'} strokeWidth="1.5" />
                  <text y="5" textAnchor="middle" fontSize="16">{alienLevelCleared ? '💥' : '👾'}</text>
                </g>
                <rect x={centerX - labelWidth / 2} y={centerY + offsetY - 10} width={labelWidth} height="15" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke={alienLevelCleared ? '#10b981' : '#475569'} strokeWidth="1" />
                <text x={centerX} y={centerY + offsetY + 1} fill={alienLevelCleared ? '#6ee7b7' : '#f8fafc'} fontSize="9.5" fontWeight="bold" textAnchor="middle">{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const filteredUsers = adminUsers.filter(user =>
    (user.nombre || '').toLocaleLowerCase().includes(adminSearch.toLocaleLowerCase())
    && (adminGroupFilter === '' || String(user.grupo ?? '') === adminGroupFilter)
  );

if (!currentUser && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-slate-100">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserRound size={30} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">¡Bienvenido!</h2>
          <p className="text-slate-500 mb-6">
            {isRegistering ? 'Crea tu cuenta para guardar tus puntos y retos.' : 'Inicia sesión con tu correo para continuar.'}
          </p>

          {!firebaseConfigured && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl text-left">
              <strong>Falta configuración:</strong> Crea tu archivo <code>.env.local</code> con tus variables <code>VITE_FIREBASE_*</code> para activar el acceso.
            </div>
          )}

          {authError && (
            <p className="text-rose-600 text-sm font-bold mb-4 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {authError}
            </p>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Nombre completo (Ej. Juan Pérez)"
                  value={authForm.nombre}
                  onChange={(e) => setAuthForm({ ...authForm, nombre: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 font-semibold"
                />
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Grupo de entrenamiento (Ej. 101)"
                  value={authForm.grupo}
                  onChange={(e) => setAuthForm({ ...authForm, grupo: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 font-semibold"
                />
              </>
            )}
            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={authForm.correo}
              onChange={(e) => setAuthForm({ ...authForm, correo: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 font-semibold"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 font-semibold"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl text-lg shadow-lg transition-all"
            >
              {isRegistering ? 'REGISTRARME' : 'INGRESAR A CLASE'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
            className="mt-4 text-blue-600 text-sm font-bold hover:underline"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Primera vez? Regístrate aquí'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">o también</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-300 transition-all text-base shadow-sm hover:shadow"
          >
            Entrar como Invitado (Modo Práctica)
          </button>
          <p className="text-xs text-slate-400 mt-2">
            No requiere cuenta y tu progreso no se guardará en la base de datos.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              className="text-slate-400 text-sm hover:text-slate-600 underline font-medium"
            >
              {showAdminLogin ? 'Volver a ingreso estudiantes' : 'Acceso Profesor / Administrador'}
            </button>

            {showAdminLogin && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
                <input
                  type="password"
                  placeholder="Contraseña de administrador"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (adminPass === 'MIGOJJ26') setIsAdmin(true);
                    else alert('Contraseña incorrecta');
                  }}
                  className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg text-sm"
                >
                  Entrar como Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    const filteredUsers = adminUsers.filter((u) => {
      const matchesName = (u.nombre || '').toLowerCase().includes(adminSearch.toLowerCase());
      const matchesGroup = adminGroupFilter === '' || String(u.grupo) === adminGroupFilter.trim();
      return matchesName && matchesGroup;
    });

    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Panel de Profesor (Tiempo Real)</h1>
              <p className="text-slate-500">Monitoreo en vivo desde Cloud Firestore</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {currentUser && (
                <button onClick={() => setIsAdmin(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl">
                  Ver Vista Estudiante
                </button>
              )}
              <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl">
                Salir del Modo Admin
              </button>
            </div>
          </div>

          {adminError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl font-medium">
              {adminError}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="number"
              placeholder="Filtrar por grupo..."
              value={adminGroupFilter}
              onChange={(e) => setAdminGroupFilter(e.target.value)}
              className="w-48 px-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-sm">
                  <th className="p-4">Estudiante</th>
                  <th className="p-4 text-center">Grupo</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4">Último inicio de sesión</th>
                  <th className="p-4 text-center">Tiempo en la página</th>
                  <th className="p-4 text-center">Puntos</th>
                  <th className="p-4">Juegos jugados</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-slate-400">
                      No se encontraron estudiantes con esos filtros.
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => {
                  const totalSeg = Number(user.tiempoTotalSegundos || 0);
                  const horas = Math.floor(totalSeg / 3600);
                  const minutos = Math.floor((totalSeg % 3600) / 60);
                  const ultimoLoginStr = user.ultimoLogin?.toDate
                    ? user.ultimoLogin.toDate().toLocaleString()
                    : '—';

                  return (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{user.nombre}</div>
                        <div className="text-xs text-slate-500">{user.correo}</div>
                      </td>
                      <td className="p-4 text-center font-bold text-blue-700">{user.grupo}</td>
                      <td className="p-4 text-center">
                        <span
                          title={user.enLinea ? 'En línea' : 'Desconectado'}
                          className={`inline-block w-3.5 h-3.5 rounded-full ${user.enLinea ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}
                        />
                      </td>
                      <td className="p-4 text-xs text-slate-600">{ultimoLoginStr}</td>
                      <td className="p-4 text-center font-semibold text-slate-700">
                        {horas}h {minutos}m
                      </td>
                      <td className="p-4 text-center font-extrabold text-emerald-600 text-xl">{user.puntos || 0}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(user.juegosJugados || []).length === 0 ? (
                            <span className="text-xs text-slate-400">Ninguno</span>
                          ) : (
                            user.juegosJugados.map((juego) => (
                              <span key={juego} className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold uppercase">
                                {juego}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Encabezado */}
      <header className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 text-white py-14 px-6 text-center shadow-2xl relative overflow-hidden">
        {/* Botón Top del Grupo arriba a la izquierda */}
        {!currentUser?.isGuest && (
          <button
            onClick={() => setShowTopGroup(true)}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-extrabold px-4 py-2 rounded-full text-sm shadow-lg transition-all hover:scale-105"
          >
            <Trophy size={16} /> Top Grupo {currentUser?.grupo}
          </button>
        )}

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight relative z-10 drop-shadow-lg">
          REPASO DE MATEMÁTICAS
        </h1>
        <p className="text-lg md:text-2xl max-w-4xl mx-auto font-light leading-relaxed text-indigo-100 relative z-10">
          Hola! Esta página la hice para que retomes MB con toda. Encontrarás ejercicios y actividades, así como un resumen de las cosas más importantes.
        </p>
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="font-bold text-white flex items-center gap-2">
              <UserRound size={16} /> {currentUser?.nombre}
              {currentUser?.isGuest && <span className="text-xs bg-slate-700/60 px-2 py-0.5 rounded-full text-slate-200 font-normal">Modo Invitado</span>}
            </span>
            <span className="bg-amber-400 text-indigo-950 font-black px-3 py-1 rounded-full text-sm">{currentUser?.puntos || 0} pts</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-indigo-200 hover:text-white underline font-semibold flex items-center gap-1">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* Modal Ranking Top del Grupo */}
      {showTopGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowTopGroup(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={28} />
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
              <Trophy className="text-amber-500" /> Top Grupo {currentUser?.grupo}
            </h2>
            <p className="text-slate-500 text-sm mb-6">Clasificación en tiempo real de tus compañeros</p>

            {topGroupError && (
              <p className="text-rose-600 text-xs font-bold mb-4 bg-rose-50 p-3 rounded-xl">{topGroupError}</p>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {topGroupData.map((student, idx) => {
                const isMe = student.correo === currentUser?.correo;
                return (
                  <div
                    key={student.correo || idx}
                    className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
                      isMe ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-lg w-8 ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">
                          {student.nombre} {isMe && <span className="text-xs text-amber-700 font-extrabold">(Tú)</span>}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-indigo-900 text-lg">{student.puntos || 0} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showTopGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTopGroup(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="top-group-title" className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8" onClick={event => event.stopPropagation()}>
            <button type="button" aria-label="Cerrar ranking" onClick={() => setShowTopGroup(false)} className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"><X size={24} /></button>
            <h2 id="top-group-title" className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-slate-800"><Trophy className="text-amber-500" /> Ranking Grupo {currentUser?.grupo}</h2>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {topGroupError ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">{topGroupError}</p> : topGroupData.length === 0 ? <p className="py-8 text-center text-slate-400">Aún no hay estudiantes en este grupo.</p> : topGroupData.map((user, index) => (
                <div key={user.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${user.correo === currentUser?.correo ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-lg font-black text-slate-400">#{index + 1}</span>
                    <div className="min-w-0"><p className="truncate font-bold text-slate-800">{user.nombre}</p><p className={`text-xs font-bold ${user.enLinea ? 'text-emerald-600' : 'text-slate-400'}`}>{user.enLinea ? 'En línea' : 'Desconectado'}</p></div>
                  </div>
                  <span className="shrink-0 text-xl font-extrabold text-amber-600">{user.puntos || 0} pts</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Navegación Pestañas */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {[
            { id: 'tema1', label: '1. Números Reales y Operaciones' },
            { id: 'tema2', label: '2. Productos Notables' },
            { id: 'tema3', label: '3. Ecuaciones' },
            { id: 'tema4', label: '4. Plano Cartesiano' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-5 px-8 font-bold text-lg transition-all ${
                activeTab === tab.id ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50/50' : 'text-slate-500 hover:text-blue-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'tema1' && (
          <div className="space-y-16 animate-fade-in">
            
            {/* BLOQUE A: MOTIVACIÓN MEJORADO */}
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
              {/* Decoración superior */}
              <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"></div>
              
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-amber-100 p-4 rounded-full">
                    <Lightbulb className="text-amber-600 w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">Reto de Negocios</h2>
                    <p className="text-slate-500 text-lg">Aplica las matemáticas a la vida real</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-10 items-stretch">
                  
                {/* CONTENEDOR DE LA IMAGEN */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] shadow-md border-2 border-slate-200">
                  <img 
                    src="/cafe.jpg" 
                    alt="Cafetería Reto" 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                    onError={(e) => {
                      // Si la imagen falla al cargar, oculta la etiqueta img y muestra un aviso de error
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }} 
                  />
                  
                  {/* Mensaje de respaldo que SOLO aparecerá si la imagen falla o la ruta está mal escrita */}
                  <div className="relative z-10 text-center p-6 bg-white/90 rounded-xl shadow-sm backdrop-blur-sm m-4 hidden flex-col items-center">
                    <ImageIcon className="mx-auto mb-3 text-rose-500 w-12 h-12" />
                    <p className="font-semibold text-slate-800">No se pudo cargar 'cafe.jpg'</p>
                    <p className="text-sm text-slate-500 mt-1">Asegúrate de haber guardado la foto dentro de la carpeta <code className="bg-slate-200 px-1 rounded text-pink-600">public</code></p>
                  </div>
                </div>

                  {/* CONTENIDO DEL RETO */}
                  <div className="lg:col-span-3 flex flex-col justify-center">
                    <p className="text-xl mb-8 leading-relaxed text-slate-700">
                      Calcula la utilidad neta de tu primer mes en la cafetería <InlineMath math="(\text{Ingresos} - \text{Gastos})" /> resolviendo esto:
                    </p>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 shadow-inner">
                      <ul className="space-y-4 text-slate-700 text-lg">
                        <li className="flex gap-3 items-start"><CheckCircle2 className="text-emerald-500 mt-1 shrink-0"/> <span><strong>Ingresos:</strong> Venta de <InlineMath math="50" /> paquetes a <InlineMath math="\$12" /> c/u.</span></li>
                        <li className="flex gap-3 items-start"><XCircle className="text-rose-500 mt-1 shrink-0"/> <span><strong>Gastos:</strong></span></li>
                        <ul className="list-disc ml-12 space-y-3 text-slate-600">
                          <li>Materia prima: <InlineMath math="\displaystyle \frac{1}{3}" /> de tus ingresos totales.</li>
                          <li>Mantenimiento: <InlineMath math="2^4 \times 3^2" /> dólares.</li>
                          <li>Banco (Valor Absoluto): <InlineMath math="|-35 - 15|" /> dólares.</li>
                          <li>Alquiler de stand (<InlineMath math="36 \text{ m}^2" />): <InlineMath math="\$15" /> por metro de frente (<InlineMath math="\sqrt{\text{Área}}" />).</li>
                        </ul>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((opt, idx) => {
                        const vals = ['484', '116', '150', '216'];
                        let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1";
                        if (motSelection) {
                          if (opt === 'B') btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 shadow-inner"; 
                          else if (motSelection === opt) btnStyle = "bg-rose-100 border-rose-500 text-rose-900"; 
                          else btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-50"; 
                        }
                        return (
                          <button 
                            key={opt}
                            disabled={motSelection !== null}
                            onClick={() => {
                              setMotSelection(opt);
                              if (opt === 'B') addPointsToUser(10, 'reto-inicial');
                            }}
                            className={`py-4 px-6 rounded-xl border-2 font-bold text-xl transition-all duration-300 ${btnStyle}`}
                          >
                            {opt}) ${vals[idx]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    {motSelection && (
                      <div className={`mt-8 p-6 rounded-2xl border-2 animate-fade-in ${motSelection === 'B' ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                        <h3 className="font-bold text-2xl mb-4 flex items-center gap-2">
                          {motSelection === 'B' ? <><CheckCircle2 className="text-emerald-600 w-8 h-8"/> ¡Excelente cálculo!</> : <><XCircle className="text-rose-600 w-8 h-8"/> Ups, revisemos los números.</>}
                        </h3>
                        <div className="text-slate-700 space-y-2 text-lg">
                          <p><strong>Total Ingresos:</strong> <InlineMath math="50 \times 12 = \$600" /></p>
                          <p><strong>Total Gastos:</strong> <InlineMath math="200 + 144 + 50 + 90 = \$484" /></p>
                          <p className="font-extrabold text-2xl text-blue-900 pt-4 mt-4 border-t border-slate-200">
                            Utilidad: <InlineMath math="600 - 484 = \mathbf{\$116}" />
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* BLOQUE B: CARRERA MEJORADA */}
            <section className="bg-indigo-950 text-white rounded-3xl shadow-2xl overflow-hidden relative border-4 border-indigo-900 min-h-[500px] flex flex-col justify-center">
              
              {/* Pantalla Inicio */}
              {quizState === 'start' && (
                <div className="p-12 text-center flex flex-col items-center animate-fade-in">
                  <div className="bg-indigo-900/50 p-6 rounded-full mb-8 shadow-inner">
                    <Timer size={80} className="text-amber-400" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Carrera de Ejercicios</h2>
                  <p className="text-indigo-200 mb-10 max-w-2xl text-xl leading-relaxed">
                    Resuelve <strong>20 ejercicios</strong> al azar. <br/>Tienes <strong>20 segundos</strong> por pregunta.
                  </p>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Solo el primer intento te dará puntos. ¿Seguro quieres comenzar ya?')) {
                        startCountdownSequence();
                      }
                    }}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-indigo-950 font-extrabold py-5 px-12 rounded-full text-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all hover:scale-105 flex items-center gap-3"
                  >
                    <Play fill="currentColor" /> {attempts > 0 ? 'INTENTAR DE NUEVO' : 'COMENZAR AHORA'}
                  </button>
                  {attempts > 0 && <p className="mt-6 text-indigo-300 font-medium">Intentos previos: {attempts}</p>}
                </div>
              )}

              {/* Pantalla Cuenta Regresiva */}
              {quizState === 'countdown' && (
                <div className="p-12 text-center flex flex-col items-center justify-center animate-pulse">
                  <h2 className="text-8xl md:text-[150px] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-orange-600 drop-shadow-2xl">
                    {countdownNum}
                  </h2>
                </div>
              )}

              {/* Pantalla Juego */}
              {quizState === 'playing' && (
                <div className="p-6 md:p-12 animate-fade-in">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-indigo-300 font-medium mb-1">Pregunta</p>
                      <div className="text-amber-400 font-extrabold text-3xl">{currentQ + 1} <span className="text-xl text-indigo-400">/ 20</span></div>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-300 font-medium mb-1">Puntos</p>
                      <div className="text-white font-extrabold text-3xl flex items-center gap-2 justify-end">
                        <Trophy className="text-amber-400" size={28}/> {score}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-indigo-900 rounded-full h-3 mb-12 overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-amber-400'}`} style={{ width: `${(timeLeft / 20) * 100}%` }}></div>
                  </div>

                  {/* AQUÍ SE USA \displaystyle PARA QUE LAS FRACCIONES NO SE APLASTEN */}
                  <div className="bg-white/10 rounded-2xl p-10 text-center min-h-[160px] flex items-center justify-center mb-10 border border-white/20 shadow-xl backdrop-blur-sm">
                    <span className="text-5xl md:text-7xl font-serif font-bold tracking-wider">
                      <InlineMath math={`\\displaystyle ${questions[currentQ].q} = ?`} />
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleAnswer(opt === questions[currentQ].a)}
                        className="bg-indigo-800/80 hover:bg-indigo-600 text-white font-bold py-6 px-8 rounded-2xl border-2 border-indigo-500 hover:border-amber-400 transition-all text-3xl text-left flex items-center gap-6 shadow-lg hover:-translate-y-1"
                      >
                        <span className="text-amber-400/80 text-2xl font-black">{['A', 'B', 'C', 'D'][idx]})</span> 
                        {/* \displaystyle en las opciones también */}
                        <InlineMath math={`\\displaystyle ${opt}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pantalla Final */}
              {quizState === 'finished' && (
                <div className="p-12 text-center animate-fade-in">
                  <Trophy size={100} className="text-amber-400 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                  <h2 className="text-5xl font-extrabold mb-4">¡Carrera Terminada!</h2>
                  
                  <div className="bg-indigo-900/60 inline-block px-12 py-8 rounded-3xl border border-indigo-700 mb-10 shadow-2xl mt-6">
                    <p className="text-xl mb-2 text-indigo-200">Puntaje {attempts > 1 ? `(Intento #${attempts})` : 'Final'}</p>
                    <p className="text-7xl font-black text-amber-400">{score} <span className="text-4xl text-indigo-400">/ 20</span></p>
                  </div>
                  
                  <div>
                    <button 
                      onClick={startCountdownSequence} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full text-xl transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                    >
                      <RotateCcw /> VOLVER A INTENTAR
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* BLOQUE C: PROPIEDADES */}
            <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BookOpen className="text-blue-600" /> Resumen de Propiedades
              </h2>

              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                {['Suma', 'Multiplicación', 'Fracciones', 'Potenciación', 'Radicación', 'Valor Absoluto'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab.toLowerCase())}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeSubTab === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {activeSubTab === 'suma' && (
                  <>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><strong className="block text-blue-900">Conmutativa</strong><InlineMath math="a + b = b + a" /></div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><strong className="block text-blue-900">Asociativa</strong><InlineMath math="(a + b) + c = a + (b + c)" /></div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><strong className="block text-blue-900">Elemento Neutro</strong><InlineMath math="a + 0 = a" /></div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><strong className="block text-blue-900">Inverso Aditivo</strong><InlineMath math="a + (-a) = 0" /></div>
                  </>
                )}
                {activeSubTab === 'multiplicación' && (
                  <>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><strong className="block text-emerald-900">Conmutativa</strong><InlineMath math={"a \\cdot b = b \\cdot a"} /></div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><strong className="block text-emerald-900">Asociativa</strong><InlineMath math={"(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)"} /></div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><strong className="block text-emerald-900">Inverso</strong><InlineMath math={"a \\cdot \\frac{1}{a} = 1"} /></div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100"><strong className="block text-emerald-900">Distributiva</strong><InlineMath math={"a \\cdot (b + c) = a \\cdot b + a \\cdot c"} /></div>
                  </>
                )}
                {activeSubTab === 'fracciones' && (
                  <>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><strong className="block text-purple-900">Suma (Homogénea)</strong><BlockMath math={"\\frac{a}{c} \\pm \\frac{b}{c} = \\frac{a \\pm b}{c}"} /></div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><strong className="block text-purple-900">Suma (Heterogénea)</strong><BlockMath math={"\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm bc}{bd}"} /></div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><strong className="block text-purple-900">Multiplicación</strong><BlockMath math={"\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}"} /></div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><strong className="block text-purple-900">División</strong><BlockMath math={"\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a \\cdot d}{b \\cdot c}"} /></div>
                  </>
                )}
                {activeSubTab === 'potenciación' && (
                  <>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100"><strong className="block text-rose-900">Multiplicación de bases iguales</strong><InlineMath math={"a^m \\cdot a^n = a^{m+n}"} /></div>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100"><strong className="block text-rose-900">División de bases iguales</strong><InlineMath math={"\\frac{a^m}{a^n} = a^{m-n}"} /></div>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100"><strong className="block text-rose-900">Potencia de potencia</strong><InlineMath math="(a^m)^n = a^{m \\cdot n}" /></div>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100"><strong className="block text-rose-900">Exponente negativo</strong><InlineMath math={"a^{-n} = \\frac{1}{a^n}"} /></div>
                  </>
                )}
                {activeSubTab === 'radicación' && (
                  <>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100"><strong className="block text-orange-900">Potencia fraccionaria</strong><InlineMath math={"\\sqrt[n]{a^m} = a^{\\frac{m}{n}}"} /></div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100"><strong className="block text-orange-900">Raíz de un producto</strong><InlineMath math={"\\sqrt[n]{a \\cdot b} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}"} /></div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100"><strong className="block text-orange-900">Raíz de un cociente</strong><InlineMath math={"\\sqrt[n]{\\frac{a}{b}} = \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}}"} /></div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100"><strong className="block text-orange-900">Raíz de raíz</strong><InlineMath math={"\\sqrt[m]{\\sqrt[n]{a}} = \\sqrt[m \\cdot n]{a}"} /></div>
                  </>
                )}
                {activeSubTab === 'valor absoluto' && (
                  <>
                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100"><strong className="block text-cyan-900">No negatividad</strong><InlineMath math={"|a| \\geq 0"} /></div>
                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100"><strong className="block text-cyan-900">Simetría</strong><InlineMath math="|a| = |-a|" /></div>
                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100"><strong className="block text-cyan-900">Multiplicación</strong><InlineMath math={"|a \\cdot b| = |a| \\cdot |b|"} /></div>
                    <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100"><strong className="block text-cyan-900">Desigualdad triangular</strong><InlineMath math={"|a + b| \\leq |a| + |b|"} /></div>
                  </>
                )}
              </div>
            </section>

          </div>
        )}

        {activeTab === 'tema2' && (
          <div className="space-y-16 animate-fade-in">
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
              <div className="h-3 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-100 p-4 rounded-full"><Lightbulb className="text-emerald-600 w-10 h-10" /></div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">El Huerto Urbano de la Facultad</h2>
                    <p className="text-slate-500 text-lg">Reto secuencial de Productos Notables y Factorización</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-10 items-stretch">
                  <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] shadow-md border-2 border-slate-200">
                    <img
                      src="/huerto.jpg"
                      alt="Huerto Urbano"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        event.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="relative z-10 text-center p-6 bg-white/90 rounded-xl shadow-sm backdrop-blur-sm m-4 hidden flex-col items-center">
                      <ImageIcon className="mx-auto mb-3 text-rose-500 w-12 h-12" />
                      <p className="font-semibold text-slate-800">No se pudo cargar 'huerto.jpg'</p>
                      <p className="text-sm text-slate-500 mt-1">Guarda tu imagen en la carpeta <code className="bg-slate-200 px-1 rounded text-pink-600">public</code></p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex flex-col justify-center">
                    <div className="flex gap-2 mb-6">
                      {huertoQuestions.map((question, index) => (
                        <button
                          key={question.id}
                          onClick={() => setHuertoStep(index)}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all border ${
                            huertoStep === index
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : huertoSelections[index]
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Paso {index + 1}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6 shadow-inner">
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">{huertoQuestions[huertoStep].title}</h3>
                      <p className="text-slate-700 text-lg leading-relaxed">{huertoQuestions[huertoStep].desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((label, optionIndex) => {
                        const option = huertoQuestions[huertoStep].options[optionIndex];
                        const selected = huertoSelections[huertoStep] === option;
                        const correct = option === huertoQuestions[huertoStep].correct;
                        const answered = huertoSelections[huertoStep] !== undefined;
                        let buttonStyle = 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1';

                        if (answered) {
                          if (correct) buttonStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-extrabold shadow-inner';
                          else if (selected) buttonStyle = 'bg-rose-100 border-rose-500 text-rose-900 font-extrabold';
                          else buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                        }

                        return (
                          <button
                            key={label}
                            disabled={answered}
                            onClick={() => {
                              setHuertoSelections(prev => ({ ...prev, [huertoStep]: option }));
                              if (correct) addPointsToUser(5, `foodtruck-paso-${foodTruckStep + 1}`);
                            }}
                            className={`py-4 px-6 rounded-xl border-2 font-bold text-xl transition-all duration-300 ${buttonStyle}`}
                          >
                            {label}) <InlineMath math={`\\displaystyle ${option}`} />
                          </button>
                        );
                      })}
                    </div>

                    {huertoSelections[huertoStep] && (
                      <div className={`mt-6 p-6 rounded-2xl border-2 animate-fade-in ${
                        huertoSelections[huertoStep] === huertoQuestions[huertoStep].correct
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-rose-50 border-rose-500'
                      }`}>
                        <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                          {huertoSelections[huertoStep] === huertoQuestions[huertoStep].correct
                            ? <><CheckCircle2 className="text-emerald-600 w-6 h-6" /> ¡Correcto!</>
                            : <><XCircle className="text-rose-600 w-6 h-6" /> Respuesta Incorrecta</>}
                        </h4>
                        <div className="text-slate-700 text-lg">
                          <p className="font-medium"><strong>Demostración:</strong></p>
                          <InlineMath math={`\\displaystyle ${huertoQuestions[huertoStep].solution}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden relative border-4 border-slate-800 min-h-[500px] flex flex-col justify-center">
              {pairsState === 'start' && (
                <div className="p-12 text-center flex flex-col items-center animate-fade-in">
                  <div className="bg-slate-800 p-6 rounded-full mb-8 shadow-inner"><Timer size={80} className="text-amber-400" /></div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Parejas Factorizadas</h2>
                  <p className="text-slate-300 mb-10 max-w-2xl text-xl leading-relaxed">
                    Empareja cada expresión con su equivalente desarrollada o factorizada.<br />
                    Tienes un máximo de <strong>10 minutos</strong> para encontrar los 8 pares.
                  </p>
                  <button
                    onClick={startPairsGame}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-extrabold py-5 px-12 rounded-full text-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 flex items-center gap-3"
                  >
                    <Play fill="currentColor" /> {pairsAttempts > 0 ? 'VOLVER A JUGAR' : 'INICIAR ACTIVIDAD'}
                  </button>
                  {pairsAttempts > 0 && <p className="mt-6 text-slate-400 font-medium">Intentos previos: {pairsAttempts}</p>}
                </div>
              )}

              {pairsState === 'playing' && (
                <div className="p-6 md:p-12 animate-fade-in">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-slate-400 font-medium mb-1">Tiempo Restante</p>
                      <div className="text-amber-400 font-extrabold text-3xl font-mono">
                        {Math.floor(pairsTimer / 60)}:{(pairsTimer % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <button onClick={finishPairsGame} className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 px-8 rounded-xl text-lg transition-all shadow-lg">
                      TERMINAR
                    </button>
                  </div>

                  <p className="text-slate-300 text-center mb-8 text-lg">
                    {selectedLeft === null
                      ? 'Selecciona una expresión de la columna A; después elige su pareja en la columna B.'
                      : 'Ahora selecciona su pareja en la columna B.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:gap-8 mb-4">
                    <h3 className="font-bold text-center text-slate-400 uppercase tracking-wider text-xs md:text-sm">Expresiones (Columna A)</h3>
                    <h3 className="font-bold text-center text-slate-400 uppercase tracking-wider text-xs md:text-sm">Contrapartes (Columna B)</h3>
                  </div>
                  <div className="relative grid grid-cols-2 gap-3 md:gap-8">
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                      viewBox="0 0 1000 1264"
                      preserveAspectRatio="none"
                    >
                      {Object.entries(userMatches).map(([leftIndexString, rightIndex]) => {
                        const leftIndex = Number(leftIndexString);
                        const startY = 72 + leftIndex * 160;
                        const endY = 72 + rightIndex * 160;
                        return (
                          <path
                            key={leftIndex}
                            d={`M 480 ${startY} C 510 ${startY}, 490 ${endY}, 520 ${endY}`}
                            fill="none"
                            stroke={pairColors[leftIndex % pairColors.length]}
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        );
                      })}
                      {selectedLeft !== null && userMatches[selectedLeft] === undefined && (
                        <path
                          d={`M 480 ${72 + selectedLeft * 160} C 520 ${72 + selectedLeft * 160}, 480 632, 520 632`}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray="10 10"
                        />
                      )}
                    </svg>

                    <div className="space-y-4">
                      {leftList.map((item, index) => {
                        const selected = selectedLeft === index;
                        const matched = userMatches[index] !== undefined;
                        const color = matched ? pairColors[index % pairColors.length] : undefined;
                        let itemStyle = 'bg-slate-800/80 border-slate-700 text-white hover:border-emerald-400';
                        if (selected) itemStyle = 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg';
                        else if (matched) itemStyle = 'bg-slate-800/80';

                        return (
                          <button
                            key={index}
                            disabled={matched}
                            onClick={() => handleSelectLeft(index)}
                            style={matched ? { borderColor: color, color, backgroundColor: `${color}20` } : undefined}
                            className={`relative z-20 flex h-36 w-full items-center justify-between gap-2 rounded-2xl border-2 px-2 text-left text-sm font-bold transition-all duration-200 sm:px-4 md:text-xl ${itemStyle}`}
                          >
                            <span className="min-w-0"><InlineMath math={`\\displaystyle ${item.expr}`} /></span>
                            {matched && <span style={{ backgroundColor: color }} className="shrink-0 rounded-full px-2 py-1 text-xs font-black text-slate-950">Conectado</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      {rightList.map((item, index) => {
                        const matchedEntry = Object.entries(userMatches).find(([, rightIndex]) => rightIndex === index);
                        const matched = matchedEntry !== undefined;
                        const color = matched ? pairColors[Number(matchedEntry[0]) % pairColors.length] : undefined;
                        const itemStyle = matched
                          ? 'bg-slate-800/80'
                          : 'bg-slate-800/80 border-slate-700 text-white hover:border-teal-400';

                        return (
                          <button
                            key={index}
                            disabled={matched}
                            onClick={() => handleSelectRight(index)}
                            style={matched ? { borderColor: color, color, backgroundColor: `${color}20` } : undefined}
                            className={`relative z-20 flex h-36 w-full items-center justify-between gap-2 rounded-2xl border-2 px-2 text-left text-sm font-bold transition-all duration-200 sm:px-4 md:text-xl ${itemStyle}`}
                          >
                            <span className="min-w-0"><InlineMath math={`\\displaystyle ${item.expr}`} /></span>
                            {matched && <span style={{ backgroundColor: color }} className="shrink-0 rounded-full px-2 py-1 text-xs font-black text-slate-950">Conectado</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {pairsState === 'finished' && (
                <div className="p-8 md:p-12 animate-fade-in text-center">
                  <Trophy size={80} className="text-amber-400 mx-auto mb-6" />
                  <h2 className="text-4xl font-extrabold mb-2">¡Resultados de Parejas!</h2>
                  <p className="text-2xl text-slate-300 mb-6">Aciertos: <span className="text-amber-400 font-extrabold">{pairsScore}</span> / 8</p>
                  <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700 max-w-4xl mx-auto mb-8 text-left space-y-3">
                    <h3 className="font-bold text-center text-emerald-400 text-lg mb-4">Revisión de Conexiones Correctas</h3>
                    {leftList.map((leftItem, leftIndex) => {
                      const rightIndex = userMatches[leftIndex];
                      const userRightItem = rightIndex !== undefined ? rightList[rightIndex] : null;
                      const correct = userRightItem && leftItem.pairId === userRightItem.pairId;
                      const correctRightItem = rightList.find(item => item.pairId === leftItem.pairId);

                      return (
                        <div key={leftIndex} className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${correct ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'}`}>
                          <div className="flex items-center gap-3">
                            {correct ? <CheckCircle2 className="text-emerald-400 shrink-0" /> : <XCircle className="text-rose-400 shrink-0" />}
                            <span className="font-bold"><InlineMath math={`\\displaystyle ${leftItem.expr}`} /></span>
                          </div>
                          <div className="text-sm">
                            {correct ? (
                              <span className="text-emerald-300 font-semibold">Correcto: <InlineMath math={`\\displaystyle ${userRightItem.expr}`} /></span>
                            ) : (
                              <span className="text-rose-300">
                                Tu respuesta: {userRightItem ? <InlineMath math={`\\displaystyle ${userRightItem.expr}`} /> : 'Sin respuesta'} |{' '}
                                <strong className="text-emerald-400">Correcto: <InlineMath math={`\\displaystyle ${correctRightItem.expr}`} /></strong>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={startPairsGame} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-full text-xl transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto shadow-lg">
                    <RotateCcw /> VOLVER A INTENTAR
                  </button>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BookOpen className="text-emerald-600" /> Resumen de Productos Notables y Factorización
              </h2>
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                {[
                  { id: 'factorComun', label: '1. Factor Común' },
                  { id: 'diferenciaCuadrados', label: '2. Diferencia de Cuadrados' },
                  { id: 'trinomio', label: '3. Trinomio x² + bx + c' },
                  { id: 'racionalizacion', label: '4. Racionalización' },
                  { id: 'binomio', label: '5. Binomio Cuadrado Perfecto' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTema2SubTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${tema2SubTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {tema2SubTab === 'factorComun' && (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-slate-800">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Factor Común</h3>
                    <p className="mb-4 text-lg">Consiste en identificar el factor que se repite en todos los términos para extraerlo mediante la división.</p>
                    <div className="bg-white p-4 rounded-xl border border-emerald-200"><strong className="block text-emerald-900 mb-1">Ejemplo:</strong><BlockMath math="6x^3 + 9x^2 = 3x^2(2x + 3)" /></div>
                  </div>
                )}
                {tema2SubTab === 'diferenciaCuadrados' && (
                  <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 text-slate-800">
                    <h3 className="text-xl font-bold text-teal-900 mb-2">Diferencia de Cuadrados</h3>
                    <p className="mb-4 text-lg">Un binomio formado por la resta de dos cuadrados se factoriza como la suma por la diferencia de sus raíces.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-teal-200"><strong className="block text-teal-900 mb-1">Fórmula General:</strong><BlockMath math="a^2 - b^2 = (a - b)(a + b)" /></div>
                      <div className="bg-white p-4 rounded-xl border border-teal-200"><strong className="block text-teal-900 mb-1">Ejemplo:</strong><BlockMath math="x^2 - 16 = (x - 4)(x + 4)" /></div>
                    </div>
                  </div>
                )}
                {tema2SubTab === 'trinomio' && (
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-slate-800">
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Trinomio de la forma <InlineMath math="x^2 + bx + c" /></h3>
                    <p className="mb-4 text-lg">Busca dos números que multiplicados den c y sumados den b.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-indigo-200"><strong className="block text-indigo-900 mb-1">Fórmula:</strong><BlockMath math="x^2 + (m+n)x + mn = (x + m)(x + n)" /></div>
                      <div className="bg-white p-4 rounded-xl border border-indigo-200"><strong className="block text-indigo-900 mb-1">Ejemplo:</strong><BlockMath math="x^2 + 5x + 6 = (x + 2)(x + 3)" /></div>
                    </div>
                  </div>
                )}
                {tema2SubTab === 'racionalizacion' && (
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 text-slate-800 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Racionalización</h3>
                      <p className="text-lg">Elimina la raíz del denominador multiplicando numerador y denominador por una expresión conveniente.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-purple-200">
                        <strong className="block text-purple-900 text-lg mb-2">Caso monomio</strong>
                        <BlockMath math="\frac{6}{\sqrt{3}} = \frac{6\sqrt{3}}{3} = 2\sqrt{3}" />
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-purple-200">
                        <strong className="block text-purple-900 text-lg mb-2">Caso binomio (conjugado)</strong>
                        <BlockMath math="\frac{2}{\sqrt{5}-1} = \frac{2(\sqrt{5}+1)}{4} = \frac{\sqrt{5}+1}{2}" />
                      </div>
                    </div>
                  </div>
                )}
                {tema2SubTab === 'binomio' && (
                  <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-slate-800">
                    <h3 className="text-xl font-bold text-rose-900 mb-2">Binomio Cuadrado Perfecto</h3>
                    <p className="mb-4 text-lg">El primer y tercer término son cuadrados perfectos y el término central es el doble producto de sus raíces.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-rose-200"><strong className="block text-rose-900 mb-1">Fórmula General:</strong><BlockMath math="a^2 \pm 2ab + b^2 = (a \pm b)^2" /></div>
                      <div className="bg-white p-4 rounded-xl border border-rose-200"><strong className="block text-rose-900 mb-1">Ejemplo:</strong><BlockMath math="x^2 - 6x + 9 = (x - 3)^2" /></div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tema3' && (
          <div className="space-y-16 animate-fade-in">
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
              <div className="h-3 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-rose-500"></div>
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-orange-100 p-4 rounded-full"><Lightbulb className="text-orange-600 w-10 h-10" /></div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">El Food Truck del Campus</h2>
                    <p className="text-slate-500 text-lg">Aplica ecuaciones lineales y cuadráticas a la gestión real de un negocio</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-10 items-stretch">
                  <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] shadow-md border-2 border-slate-200">
                    <img
                      src="/foodtruck.jpg"
                      alt="Food Truck Campus"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                        event.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="relative z-10 text-center p-6 bg-white/90 rounded-xl shadow-sm backdrop-blur-sm m-4 hidden flex-col items-center">
                      <ImageIcon className="mx-auto mb-3 text-rose-500 w-12 h-12" />
                      <p className="font-semibold text-slate-800">No se pudo cargar 'foodtruck.jpg'</p>
                      <p className="text-sm text-slate-500 mt-1">Guarda tu imagen en la carpeta <code className="bg-slate-200 px-1 rounded text-pink-600">public</code></p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex flex-col justify-center">
                    <div className="flex gap-2 mb-6">
                      {foodTruckQuestions.map((question, index) => (
                        <button
                          key={question.id}
                          onClick={() => setFoodTruckStep(index)}
                          className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all border ${
                            foodTruckStep === index
                              ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                              : foodTruckSelections[index]
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Paso {index + 1}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6 shadow-inner">
                      <h3 className="text-xl font-bold text-orange-900 mb-2">{foodTruckQuestions[foodTruckStep].title}</h3>
                      <p className="text-slate-700 text-lg leading-relaxed">{foodTruckQuestions[foodTruckStep].desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((label, optionIndex) => {
                        const option = foodTruckQuestions[foodTruckStep].options[optionIndex];
                        const selected = foodTruckSelections[foodTruckStep] === option;
                        const correct = option === foodTruckQuestions[foodTruckStep].correct;
                        const answered = foodTruckSelections[foodTruckStep] !== undefined;
                        let buttonStyle = 'bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:shadow-lg hover:-translate-y-1';

                        if (answered) {
                          if (correct) buttonStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-extrabold shadow-inner';
                          else if (selected) buttonStyle = 'bg-rose-100 border-rose-500 text-rose-900 font-extrabold';
                          else buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                        }

                        return (
                          <button
                            key={label}
                            disabled={answered}
                            onClick={() => {
                              setFoodTruckSelections(prev => ({ ...prev, [foodTruckStep]: option }));
                              if (correct) addPointsToUser(5, `coworking-paso-${coworkingStep + 1}`);
                            }}
                            className={`py-4 px-6 rounded-xl border-2 font-bold text-xl transition-all duration-300 ${buttonStyle}`}
                          >
                            {label}) <InlineMath math={`\\displaystyle ${option}`} />
                          </button>
                        );
                      })}
                    </div>

                    {foodTruckSelections[foodTruckStep] && (
                      <div className={`mt-6 p-6 rounded-2xl border-2 animate-fade-in ${
                        foodTruckSelections[foodTruckStep] === foodTruckQuestions[foodTruckStep].correct
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-rose-50 border-rose-500'
                      }`}>
                        <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                          {foodTruckSelections[foodTruckStep] === foodTruckQuestions[foodTruckStep].correct
                            ? <><CheckCircle2 className="text-emerald-600 w-6 h-6" /> ¡Respuesta Correcta!</>
                            : <><XCircle className="text-rose-600 w-6 h-6" /> Revisa el procedimiento.</>}
                        </h4>
                        <div className="text-slate-700 text-lg">
                          <p className="font-medium"><strong>Procedimiento:</strong></p>
                          <InlineMath math={`\\displaystyle ${foodTruckQuestions[foodTruckStep].solution}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden relative border-4 border-slate-800 min-h-[500px] flex flex-col justify-center">
              {safeState === 'start' && (
                <div className="p-12 text-center flex flex-col items-center animate-fade-in">
                  <div className="bg-amber-500/10 p-6 rounded-full mb-8 border border-amber-500/30"><Lock size={80} className="text-amber-400 animate-pulse" /></div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">LA CAJA FUERTE DE JJ</h2>
                  <p className="text-slate-300 mb-10 max-w-2xl text-xl leading-relaxed">
                    Resuelve las 4 ecuaciones generadas al azar para obtener la combinación secreta <InlineMath math="(x, y, z, w)" />.<br />
                    ¡Si abres la caja en el <strong>primer intento</strong> ganarás <strong>4 PUNTOS GLOBALES</strong>!
                  </p>
                  <button onClick={startSafeGame} className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold py-5 px-12 rounded-full text-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 flex items-center gap-3">
                    <Play fill="currentColor" /> INICIAR DESAFÍO DE LA CAJA
                  </button>
                </div>
              )}

              {safeState === 'playing' && (
                <div className="p-6 md:p-12 animate-fade-in">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div>
                      <p className="text-slate-400 font-medium mb-1">Tiempo Restante</p>
                      <div className="text-amber-400 font-extrabold text-3xl font-mono flex items-center gap-2">
                        <Timer size={24} /> {Math.floor(safeTimer / 60)}:{(safeTimer % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1">Intentos Realizados</span>
                      <span className="text-2xl font-black text-amber-400 bg-slate-800 px-4 py-1 rounded-xl border border-slate-700">{safeAttemptsCount}</span>
                    </div>
                    <button onClick={() => handleSafeAttempt(true)} className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3 px-6 rounded-xl text-lg transition-all shadow-lg">TERMINAR</button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {safeEqs.map(equation => {
                      const quadratic = equation.type === 'quadratic';
                      return (
                        <div key={equation.varName} className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2 mb-4">
                            <span className="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg text-lg uppercase">Variable {equation.varName}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${quadratic ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40' : 'bg-blue-900/60 text-blue-300 border border-blue-500/40'}`}>
                              {quadratic ? 'Ecuación Cuadrática' : 'Ecuación Lineal'}
                            </span>
                          </div>
                          <div className="my-4 text-center bg-slate-950/60 py-6 rounded-xl border border-slate-800">
                            <span className="text-3xl font-bold text-slate-100"><InlineMath math={`\\displaystyle ${equation.displayEq}`} /></span>
                          </div>
                          {quadratic ? (
                            <div className="mt-2 grid sm:grid-cols-2 gap-3">
                              {[0, 1].map(answerIndex => (
                                <div key={answerIndex}>
                                  <label htmlFor={`safe-value-${equation.varName}-${answerIndex}`} className="mb-1 block text-slate-400 font-bold">
                                    Raíz {answerIndex + 1} de {equation.varName}
                                  </label>
                                  <input
                                    id={`safe-value-${equation.varName}-${answerIndex}`}
                                    type="number"
                                    value={safeInputs[equation.varName][answerIndex]}
                                    onChange={(event) => setSafeInputs(prev => ({
                                      ...prev,
                                      [equation.varName]: prev[equation.varName].map((answer, index) => index === answerIndex ? event.target.value : answer)
                                    }))}
                                    placeholder={`Valor de ${equation.varName}`}
                                    className="w-full bg-slate-950 border-2 border-slate-600 focus:border-amber-400 text-amber-300 text-2xl font-black text-center py-2 rounded-xl outline-none transition-all"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                              <label htmlFor={`safe-value-${equation.varName}`} className="text-slate-400 font-bold text-lg whitespace-nowrap">Valor de {equation.varName}:</label>
                              <input
                                id={`safe-value-${equation.varName}`}
                                type="number"
                                value={safeInputs[equation.varName][0]}
                                onChange={(event) => setSafeInputs(prev => ({
                                  ...prev,
                                  [equation.varName]: [event.target.value, prev[equation.varName][1]]
                                }))}
                                placeholder="?"
                                className="w-full bg-slate-950 border-2 border-slate-600 focus:border-amber-400 text-amber-300 text-2xl font-black text-center py-2 rounded-xl outline-none transition-all"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <button onClick={() => handleSafeAttempt(false)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 px-14 rounded-2xl text-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105">ABRIR CAJA FUERTE</button>
                    {safeAttemptsCount > 0 && <p className="mt-3 text-rose-400 text-sm font-medium">Fallaste el primer intento. Puedes continuar, pero ya no ganarás puntos globales.</p>}
                  </div>
                </div>
              )}

              {safeState === 'finished' && (
                <div className="p-8 md:p-12 animate-fade-in text-center">
                  <div className="bg-amber-400/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400"><Trophy size={60} /></div>
                  <h2 className="text-4xl font-extrabold mb-2">Resumen de la Caja Fuerte</h2>
                  <p className="text-slate-400 text-lg mb-6">Puntos Ganados: <strong className="text-amber-400 text-2xl">{safeScore} pts</strong> | Intentos Totales: <strong className="text-white text-2xl">{safeAttemptsCount}</strong></p>
                  <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 max-w-4xl mx-auto mb-8 text-left space-y-4">
                    <h3 className="font-bold text-center text-amber-400 text-xl mb-4">Resultados por Variable y Soluciones Reales</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {safeEqs.map(equation => {
                        const correct = isSafeAnswerCorrect(equation, safeInputs[equation.varName]);
                        const solutionValues = getSafeSolutions(equation);
                        const response = equation.type === 'quadratic'
                          ? safeInputs[equation.varName].map(value => value || 'Sin respuesta').join(' y ')
                          : safeInputs[equation.varName][0] || 'Sin respuesta';
                        return (
                          <div key={equation.varName} className={`p-4 rounded-xl border-2 ${correct ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-black text-xl text-amber-300">Variable {equation.varName}</span>
                              {correct ? <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm"><CheckCircle2 size={18} /> Acertado</span> : <span className="flex items-center gap-1 text-rose-400 font-bold text-sm"><XCircle size={18} /> Fallado</span>}
                            </div>
                            <p className="text-slate-300 text-sm mb-1">Ecuación: <InlineMath math={`\\displaystyle ${equation.displayEq}`} /></p>
                            <p className="text-slate-300 text-sm mb-1">Tu respuesta: <strong>{response}</strong></p>
                            <p className="text-emerald-400 font-semibold text-sm">Solución válida: <InlineMath math={`\\displaystyle ${solutionValues.map(solution => `${equation.varName} = ${solution}`).join('\\text{ o } ')}`} /></p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={startSafeGame} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 px-10 rounded-full text-xl transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto shadow-lg">
                    <RotateCcw /> JUGAR DE NUEVO
                  </button>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-amber-600" /> Repaso de Ecuaciones</h2>
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
                {[
                  { id: 'banco', label: 'Banco resuelto' },
                  { id: 'balanza', label: '1. Principio de la balanza' },
                  { id: 'lineal', label: '2. Ecuación lineal' },
                  { id: 'cuadratica', label: '3. Ecuación cuadrática' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSafeReviewTab(tab.id)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${safeReviewTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {safeReviewTab === 'banco' && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setSafeBankFilter('lineales')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${safeBankFilter === 'lineales' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Ecuaciones Lineales (1 - 10)
                    </button>
                    <button onClick={() => setSafeBankFilter('cuadraticas')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${safeBankFilter === 'cuadraticas' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Ecuaciones Cuadráticas (11 - 16)
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {equationBank
                      .filter(equation => safeBankFilter === 'lineales' ? equation.type === 'linear' : equation.type === 'quadratic')
                      .map(equation => (
                        <div key={equation.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all">
                          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-md">#{equation.id}</span>
                            <span className="text-emerald-700 font-bold text-sm">
                              Solución: <InlineMath math={`\\displaystyle ${getSafeSolutions(equation).map(solution => `x = ${solution}`).join(', ')}`} />
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center mb-3"><BlockMath math={`\\displaystyle ${equation.eq}`} /></div>
                          <div className="text-slate-600 text-sm bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                            <span className="font-bold text-slate-700 block mb-1">Paso a paso:</span>
                            <InlineMath math={`\\displaystyle ${equation.steps}`} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {safeReviewTab === 'balanza' && (
                <div className="space-y-6 text-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">Manejo de ecuaciones: el principio de la balanza</h3>
                    <p>Una ecuación es una igualdad (<InlineMath math="A = B" />) que funciona como una balanza en equilibrio: cualquier operación que apliques a un lado debes aplicarla también al otro para mantener el equilibrio. “Pasar un término haciendo la operación contraria” es una forma abreviada de describirlo.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                      <h4 className="font-bold text-amber-900 mb-2">Suma y resta</h4>
                      <p className="mb-3">Si un número suma, resta ese mismo número en ambos lados. Si resta, súmalo en ambos lados.</p>
                      <BlockMath math="x + 4 = 10 \implies x + 4 \mathbf{- 4} = 10 \mathbf{- 4} \implies x = 6" />
                    </div>
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-2">Multiplicación y división</h4>
                      <p className="mb-3">Si un número multiplica, divide ambos lados por él. Si divide, multiplica ambos lados por él.</p>
                      <BlockMath math="3x = 15 \implies \frac{3x}{\mathbf{3}} = \frac{15}{\mathbf{3}} \implies x = 5" />
                      <BlockMath math="\frac{x}{2} = 7 \implies \frac{x}{2} \cdot \mathbf{2} = 7 \cdot \mathbf{2} \implies x = 14" />
                    </div>
                    <div className="md:col-span-2 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <h4 className="font-bold text-emerald-900 mb-2">Potenciación y radicación</h4>
                      <p className="mb-3">Son operaciones inversas: para despejar una potencia, aplica la raíz correspondiente a ambos lados; para despejar una raíz, eleva ambos lados al índice de la raíz.</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <BlockMath math="\sqrt{x} = 4 \implies (\sqrt{x})^{\mathbf{2}} = 4^{\mathbf{2}} \implies x = 16" />
                        <BlockMath math="x^2 = 25 \implies \sqrt{x^2} = \pm\sqrt{25} \implies x = \pm 5" />
                      </div>
                      <p className="text-sm text-slate-600">Al sacar raíz de índice par de una variable al cuadrado, se consideran las soluciones positiva y negativa.</p>
                    </div>
                  </div>
                </div>
              )}

              {safeReviewTab === 'lineal' && (
                <div className="space-y-5 text-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Cómo resolver una ecuación lineal univariada</h3>
                    <p>Una ecuación lineal tiene una incógnita elevada a 1 y su forma base es <InlineMath math="ax + b = c" />.</p>
                  </div>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Simplifica cada lado:</strong> elimina paréntesis con la distributiva y agrupa términos semejantes.</li>
                    <li><strong>Separa variables y números:</strong> deja los términos con x a un lado y los números solos al otro.</li>
                    <li><strong>Reduce:</strong> combina términos hasta obtener una expresión como <InlineMath math="ax = d" />.</li>
                    <li><strong>Despeja:</strong> divide ambos lados por el número que multiplica a x.</li>
                  </ol>
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3">Ejemplo</h4>
                    <BlockMath math="3(x - 2) + 4 = x + 10" />
                    <p>Simplificar: <InlineMath math="3x - 6 + 4 = x + 10 \implies 3x - 2 = x + 10" /></p>
                    <p>Separar: <InlineMath math="3x - x = 10 + 2" /></p>
                    <p>Reducir: <InlineMath math="2x = 12" /></p>
                    <p>Despejar: <InlineMath math="x = \frac{12}{2} = \mathbf{6}" /></p>
                  </div>
                </div>
              )}

              {safeReviewTab === 'cuadratica' && (
                <div className="space-y-5 text-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Cómo resolver una ecuación cuadrática</h3>
                    <p>La fórmula del estudiante permite resolver una ecuación de segundo grado en su forma estándar <InlineMath math="ax^2 + bx + c = 0" />:</p>
                    <div className="my-3 p-4 bg-purple-50 rounded-xl border border-purple-100"><BlockMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" /></div>
                  </div>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Iguala a cero:</strong> pasa todos los términos a un lado.</li>
                    <li><strong>Identifica coeficientes:</strong> determina a, b y c, incluyendo sus signos.</li>
                    <li><strong>Reemplaza con paréntesis:</strong> sustituye los valores en la fórmula con cuidado con los signos negativos.</li>
                    <li><strong>Resuelve y separa el ±:</strong> calcula el discriminante y sigue una rama con + y otra con −.</li>
                  </ol>
                  <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-900 mb-3">Ejemplo: <InlineMath math="x^2 - 5x + 6 = 0" /></h4>
                    <p>Coeficientes: <InlineMath math="a = 1, \; b = -5, \; c = 6" /></p>
                    <BlockMath math="x = \frac{-(-5) \pm \sqrt{(-5)^2 - 4(1)(6)}}{2(1)}" />
                    <BlockMath math="x = \frac{5 \pm \sqrt{25 - 24}}{2} = \frac{5 \pm 1}{2}" />
                    <div className="grid md:grid-cols-2 gap-3">
                      <p>Solución 1 (+): <InlineMath math="x_1 = \frac{5 + 1}{2} = \frac{6}{2} = \mathbf{3}" /></p>
                      <p>Solución 2 (−): <InlineMath math="x_2 = \frac{5 - 1}{2} = \frac{4}{2} = \mathbf{2}" /></p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'tema4' && (
          <div className="space-y-16 animate-fade-in">
            <section className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              <div className="h-3 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600" />
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-cyan-100 p-4 rounded-full"><Lightbulb className="text-cyan-600 w-10 h-10" /></div>
                  <div><h2 className="text-3xl font-extrabold text-slate-800">Diseño de Red en un Café Coworking</h2><p className="text-slate-500 text-lg">Aplica puntos, rectas y circunferencias en el plano cartesiano</p></div>
                </div>
                <div className="grid lg:grid-cols-5 gap-10 items-stretch">
                  <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] border-2 border-slate-200">
                    <img src="/coworking.jpg" alt="Café Coworking Plano" className="absolute inset-0 w-full h-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                    <div className="relative z-10 text-center p-6 bg-white/90 rounded-xl m-4 hidden flex-col items-center"><ImageIcon className="mx-auto mb-3 text-rose-500 w-12 h-12" /><p className="font-semibold text-slate-800">No se pudo cargar 'coworking.jpg'</p><p className="text-sm text-slate-500 mt-1">Guarda la imagen en <code className="bg-slate-200 px-1 rounded">public</code></p></div>
                  </div>
                  <div className="lg:col-span-3 flex flex-col justify-center">
                    <div className="flex gap-2 mb-6">{coworkingQuestions.map((question, index) => <button key={question.id} onClick={() => setCoworkingStep(index)} className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm border ${coworkingStep === index ? 'bg-blue-600 text-white border-blue-600' : coworkingSelections[index] ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Paso {index + 1}</button>)}</div>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6"><h3 className="text-xl font-bold text-blue-950 mb-2">{coworkingQuestions[coworkingStep].title}</h3><p className="text-slate-700 text-lg">{coworkingQuestions[coworkingStep].desc}</p></div>
                    <div className={coworkingStep === 0 ? "grid grid-cols-1 gap-3" : "grid sm:grid-cols-2 gap-4"}>
                      {['A', 'B', 'C', 'D'].map((label, index) => {
                        const question = coworkingQuestions[coworkingStep];
                        const option = question.options[index];
                        const selected = coworkingSelections[coworkingStep] === option;
                        const answered = coworkingSelections[coworkingStep] !== undefined;
                        const correct = option === question.correct;
                        let style = 'bg-white border-slate-200 text-slate-700 hover:border-blue-500';
                        if (answered) style = correct ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : selected ? 'bg-rose-100 border-rose-500 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                        return <button key={label} disabled={answered} onClick={() => { setCoworkingSelections(prev => ({ ...prev, [coworkingStep]: option })); if (correct) addPointsToUser(5, `coworking-paso-${coworkingStep + 1}`); }} className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm sm:text-base text-left break-words overflow-hidden ${style}`}>{label}) <InlineMath math={`\\displaystyle ${option}`} /></button>;
                      })}
                    </div>
                    {coworkingSelections[coworkingStep] && <div className={`mt-6 p-6 rounded-2xl border-2 ${coworkingSelections[coworkingStep] === coworkingQuestions[coworkingStep].correct ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}><h4 className="font-bold text-xl mb-3">{coworkingSelections[coworkingStep] === coworkingQuestions[coworkingStep].correct ? '¡Cálculo exacto!' : 'Revisa el desarrollo.'}</h4><p className="text-slate-700"><strong>Procedimiento:</strong> <InlineMath math={`\\displaystyle ${coworkingQuestions[coworkingStep].solution}`} /></p></div>}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 text-white rounded-3xl shadow-2xl relative border-4 border-slate-800 min-h-[540px] flex flex-col justify-center">
              <button type="button" onClick={() => setAlienMuted(prev => !prev)} title={alienMuted ? 'Activar audio' : 'Silenciar audio'} className="absolute top-5 right-5 z-30 bg-slate-800 border border-slate-600 text-cyan-300 p-3 rounded-xl"><span className="sr-only">{alienMuted ? 'Activar audio' : 'Silenciar audio'}</span>{alienMuted ? <VolumeX /> : <Volume2 />}</button>
              {alienState === 'start' && <div className="p-12 text-center flex flex-col items-center"><div className="bg-cyan-500/10 p-6 rounded-full mb-8 border border-cyan-500/30"><Crosshair size={80} className="text-cyan-400 animate-pulse" /></div><h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-cyan-300">UNIDAD ANTIALIENÍGENA DE MINAS CONTIGO</h2><p className="text-slate-300 mb-10 max-w-2xl text-xl">Calibra tus armas geométricas en 3 niveles: rectas, circunferencias y triangulación. Destruye cada objetivo en el primer disparo para ganar hasta <strong>3 puntos globales</strong>.</p><button onClick={startAlienMission} className="bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-extrabold py-5 px-10 rounded-full text-xl flex items-center gap-3"><Play fill="currentColor" /> INICIAR DEFENSA PLANETARIA</button></div>}

              {alienState === 'playing' && <div className="p-6 md:p-10">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-slate-800 pb-5 pr-16"><div><span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Misión activa</span><h3 className="text-2xl font-extrabold">Nivel {alienLevel} de 3: {alienLevel === 1 ? 'Rayo Láser Lineal' : alienLevel === 2 ? 'Onda Expansiva Circular' : 'Triangulación Orbital'}</h3></div><div className="flex gap-3"><span className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">Disparos: {alienAttempts[alienLevel]}</span><span className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">Puntos: {alienHistory.reduce((total, item) => total + item.earned, 0)} / 3</span></div></div>
                <div className="grid lg:grid-cols-2 gap-8 items-center"><div>{renderCartesianRadar()}</div><div className="space-y-5">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5"><p className="text-slate-300 mb-3">{alienLevel === 1 ? <>Ingresa pendiente <InlineMath math="m" /> e intercepto <InlineMath math="b" /> de <InlineMath math="y=mx+b" /> para atravesar los tres objetivos.</> : alienLevel === 2 ? <>Ingresa centro <InlineMath math="(h,k)" /> y radio <InlineMath math="r" /> de <InlineMath math="(x-h)^2+(y-k)^2=r^2" />.</> : <>Ingresa <InlineMath math="m" /> y <InlineMath math="b" /> para cada uno de los tres lados del triángulo.</>}</p><p className="text-xs text-cyan-300">Admite enteros, decimales y fracciones, por ejemplo 1/2 o -24/7.</p></div>

                  {alienLevel === 1 && <div className="grid grid-cols-2 gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700">{[['m','Pendiente m'],['b','Intercepto b']].map(([key,label]) => <label key={key} className="text-sm font-bold text-cyan-300">{label}<input type="text" disabled={alienLevelCleared} value={alienInputs[key]} onChange={event => setAlienInputs(prev => ({...prev,[key]:event.target.value}))} className="mt-2 w-full bg-slate-950 border-2 border-slate-600 focus:border-cyan-400 text-amber-300 text-xl font-black text-center py-3 rounded-xl" /></label>)}</div>}
                  {alienLevel === 2 && <div className="grid grid-cols-3 gap-3 bg-slate-800/60 p-5 rounded-2xl border border-slate-700">{[['h','Centro h'],['k','Centro k'],['r','Radio r']].map(([key,label]) => <label key={key} className="text-sm font-bold text-cyan-300">{label}<input type="text" disabled={alienLevelCleared} value={alienInputs[key]} onChange={event => setAlienInputs(prev => ({...prev,[key]:event.target.value}))} className="mt-2 w-full bg-slate-950 border-2 border-slate-600 focus:border-cyan-400 text-amber-300 text-xl font-black text-center py-3 rounded-xl" /></label>)}</div>}
                  {alienLevel === 3 && alienScenarios[3] && <div className="space-y-3 bg-slate-800/60 p-5 rounded-2xl border border-slate-700">{alienScenarios[3].segments.map(segment => <div key={segment.key} className="p-3 bg-slate-950/70 rounded-xl"><p className="text-xs font-bold text-cyan-300 mb-2">{segment.title}</p><div className="grid grid-cols-2 gap-3">{['m','b'].map(coefficient => { const key = `${segment.key}_${coefficient}`; return <label key={key} className="text-slate-300">{coefficient}<input type="text" disabled={alienLevelCleared} value={alienInputs[key]} onChange={event => setAlienInputs(prev => ({...prev,[key]:event.target.value}))} className="ml-2 w-4/5 bg-slate-900 border border-slate-600 focus:border-cyan-400 text-amber-300 text-center py-2 rounded-lg" /></label>; })}</div></div>)}</div>}

                  {alienInputError && <p role="alert" className="p-3 bg-amber-950 border border-amber-500 rounded-xl text-amber-200">{alienInputError}</p>}
                  {alienLastShot && <div className={`p-4 rounded-2xl border-2 ${alienLastShot.hit ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-rose-950 border-rose-500 text-rose-200'}`}>{alienLastShot.hit ? (alienAttempts[alienLevel] === 1 ? '¡Impacto directo en el primer disparo! +1 punto.' : '¡Objetivos destruidos! Sin punto por intentos previos.') : '¡Disparo desviado! Corrige la trayectoria o salta el nivel.'}</div>}
                  <div className="flex flex-wrap gap-3">{!alienLevelCleared ? <><button type="button" onClick={handleAlienFire} className="flex-1 bg-gradient-to-r from-rose-500 to-orange-600 text-white font-black py-4 px-8 rounded-2xl text-xl flex justify-center items-center gap-2"><Crosshair /> FUEGO</button>{alienAttempts[alienLevel] > 0 && <button type="button" onClick={() => handleAlienAdvanceOrSkip(true)} className="bg-slate-700 text-slate-100 font-bold py-4 px-5 rounded-2xl">{alienLevel < 3 ? 'Saltar nivel' : 'Terminar misión'} <ArrowRight size={18} /></button>}</> : <button type="button" onClick={() => handleAlienAdvanceOrSkip(false)} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black py-4 px-8 rounded-2xl text-xl">{alienLevel < 3 ? 'AVANZAR AL SIGUIENTE NIVEL' : 'VER REPORTE FINAL'} <ArrowRight /></button>}</div>
                </div></div>
              </div>}

              {alienState === 'finished' && <div className="p-8 md:p-12 text-center"><div className="bg-cyan-400/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400"><Trophy size={60} /></div><h2 className="text-4xl font-extrabold mb-2">¡Misión Completada!</h2><p className="text-slate-300 text-xl mb-8">Puntaje global: <strong className="text-amber-400 text-3xl">{alienHistory.reduce((total,item) => total + item.earned,0)} / 3 pts</strong></p><div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 max-w-4xl mx-auto mb-8 text-left space-y-4"><h3 className="font-bold text-center text-cyan-300 text-xl">Bitácora de combate</h3>{alienHistory.map(item => <div key={item.level} className={`p-4 rounded-xl border-2 flex flex-wrap justify-between gap-4 ${item.earned ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-900 border-slate-600'}`}><div><p className="font-extrabold text-lg">{item.title}</p><p className="text-sm text-slate-300">Estado: {item.status} {item.firstTry ? '(Primer disparo)' : ''}</p><p className="text-sm text-cyan-300 mt-1">Solución: <InlineMath math={`\\displaystyle ${item.solution}`} /></p></div><strong className="px-4 py-2 rounded-xl bg-slate-700">+{item.earned} pt</strong></div>)}</div><button onClick={startAlienMission} className="bg-cyan-500 text-slate-950 font-extrabold py-4 px-10 rounded-full text-xl flex items-center gap-3 mx-auto"><RotateCcw /> NUEVA MISIÓN</button></div>}
            </section>

            <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-blue-600" /> Resumen de Plano Cartesiano: Rectas y Circunferencias</h2>
              <div className="flex flex-wrap gap-3 mb-6 border-b border-slate-200 pb-4"><button onClick={() => setTema4ReviewTab('recta')} className={`px-6 py-3 rounded-xl font-bold ${tema4ReviewTab === 'recta' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1. La Recta</button><button onClick={() => setTema4ReviewTab('circunferencia')} className={`px-6 py-3 rounded-xl font-bold ${tema4ReviewTab === 'circunferencia' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2. La Circunferencia</button></div>
              {tema4ReviewTab === 'recta' && <div className="space-y-5 text-slate-700"><div className="p-6 bg-blue-50 rounded-2xl"><h3 className="text-xl font-bold text-blue-900 mb-2">Definición</h3><p>Una recta es un conjunto infinito de puntos que se extiende en una dirección y mantiene pendiente constante.</p></div><div className="grid md:grid-cols-2 gap-4"><div className="p-5 bg-slate-50 rounded-2xl"><h4 className="font-bold text-blue-900 mb-2">Forma canónica</h4><BlockMath math="y = mx + b" /><p><InlineMath math="m" /> es la pendiente y <InlineMath math="b" /> el intercepto en <InlineMath math="(0,b)" />.</p></div><div className="p-5 bg-slate-50 rounded-2xl"><h4 className="font-bold text-blue-900 mb-2">Forma general</h4><BlockMath math="Ax + By + C = 0" /><p><InlineMath math="A, B, C" /> son reales, y A y B no son cero a la vez.</p></div></div><div className="p-6 bg-indigo-50 rounded-2xl space-y-3"><h3 className="text-xl font-bold text-indigo-900">Cómo encontrar la ecuación de una recta</h3><p>Con dos puntos: calcula <InlineMath math="m = \frac{y_2-y_1}{x_2-x_1}" />, sustituye en <InlineMath math="y-y_1=m(x-x_1)" /> y despeja y.</p><p>Con pendiente y punto: sustituye en la forma punto-pendiente y despeja.</p><p>Con intercepto y punto: despeja <InlineMath math="m = \frac{y_1-b}{x_1}" /> en <InlineMath math="y=mx+b" />.</p></div><div className="p-6 bg-cyan-50 rounded-2xl"><h3 className="text-xl font-bold text-cyan-900 mb-2">De general a canónica</h3><p><InlineMath math="Ax+By+C=0 \implies By=-Ax-C \implies y=-\frac{A}{B}x-\frac{C}{B}" />; por tanto <InlineMath math="m=-\frac{A}{B}" /> y <InlineMath math="b=-\frac{C}{B}" />.</p></div><div className="grid md:grid-cols-2 gap-4"><div className="p-5 bg-emerald-50 rounded-2xl"><h4 className="font-bold text-emerald-900">Recta horizontal</h4><p>Paralela al eje x: <InlineMath math="y=b" />, pendiente <InlineMath math="m=0" />. Ejemplo: <InlineMath math="y=3" />.</p></div><div className="p-5 bg-amber-50 rounded-2xl"><h4 className="font-bold text-amber-900">Recta vertical</h4><p>Paralela al eje y: <InlineMath math="x=a" />, pendiente indefinida. Ejemplo: <InlineMath math="x=-2" />.</p></div></div></div>}
              {tema4ReviewTab === 'circunferencia' && <div className="space-y-5 text-slate-700"><div className="p-6 bg-purple-50 rounded-2xl"><h3 className="text-xl font-bold text-purple-900 mb-2">Definición</h3><p>Conjunto de puntos a distancia fija r de un centro <InlineMath math="C(h,k)" />.</p></div><div className="grid md:grid-cols-2 gap-4"><div className="p-5 bg-slate-50 rounded-2xl"><h4 className="font-bold text-purple-900 mb-2">Forma canónica</h4><BlockMath math="(x-h)^2+(y-k)^2=r^2" /><p><InlineMath math="(h,k)" /> es el centro y r el radio.</p></div><div className="p-5 bg-slate-50 rounded-2xl"><h4 className="font-bold text-purple-900 mb-2">Forma general</h4><BlockMath math="x^2+y^2+Dx+Ey+F=0" /></div></div><div className="p-6 bg-indigo-50 rounded-2xl space-y-3"><h3 className="text-xl font-bold text-indigo-900">De general a canónica: completar cuadrados</h3><p>Agrupa y pasa la constante: <InlineMath math="(x^2+Dx)+(y^2+Ey)=-F" />.</p><p>Suma a ambos lados las mitades de D y E elevadas al cuadrado:</p><BlockMath math="x^2+Dx+\left(\frac{D}{2}\right)^2+y^2+Ey+\left(\frac{E}{2}\right)^2=-F+\left(\frac{D}{2}\right)^2+\left(\frac{E}{2}\right)^2" /><p>Factoriza: <InlineMath math="\left(x+\frac{D}{2}\right)^2+\left(y+\frac{E}{2}\right)^2=R" />. Centro: <InlineMath math="(h,k)=\left(-\frac{D}{2},-\frac{E}{2}\right)" />; radio: <InlineMath math="r=\sqrt{R}" />.</p></div></div>}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}