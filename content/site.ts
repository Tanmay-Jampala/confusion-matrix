/**
 * All copy on the site, taken from docs/report.pdf and rewritten for the web with the same meaning.
 * Numbers are never written here: components compute them from lib/metrics.ts.
 * Report typos fixed: "Evalution", "confution matrix documention", "mathematices".
 */

export const TITLE = "Application of Matrices in Classification Model Evaluation";

export const COURSE = {
  code: "25BSMA01",
  name: "Matrix Algebra and Calculus",
  program: "B.Tech CSE",
  section: "AIML-G",
  school: "School of Computer Science and Engineering",
  university: "Jain (Deemed-to-be) University",
  department: "Department of Data Analytics and Mathematical Sciences",
  supervisor: "Ms. Aishwarya Shanmugavel",
  date: "11-11-2026",
};

export const COURSE_LINE = `${COURSE.code} · ${COURSE.name} · ${COURSE.section} · Submitted to ${COURSE.supervisor} · ${COURSE.university} · ${COURSE.date}`;

export const INTRO = {
  question: "How well did the model classify?",
  goal: "Connect a 2 × 2 matrix to accuracy, precision, recall, and the decisions a classifier makes.",
  lede: "A confusion matrix turns a list of predictions into a compact picture: every observation lands in exactly one of four cells, and every evaluation metric is a ratio of those cells.",
  heroLeftCaption:
    "The data for evaluation is two aligned sequences, the actual labels and the predicted labels. Each position refers to the same observation, and the matrix counts how often each actual class is paired with each predicted class.",
  heroRightCaption:
    "A confusion matrix compares the actual values with the predicted values of a model, through four counts: TP, TN, FP and FN.",
};

/* ------------------------------------------------------------ five measures */
export type MeasureKey = "accuracy" | "precision" | "recall" | "f1" | "specificity";

export const MEASURES: {
  key: MeasureKey;
  title: string;
  formula: string; // mono stat-line formula
  tex: string; // KaTeX general formula
  question: string;
  interpretation: string;
}[] = [
  {
    key: "accuracy",
    title: "Accuracy",
    formula: "(TP + TN) / TOTAL",
    tex: String.raw`\text{Accuracy}=\dfrac{TP+TN}{TP+TN+FP+FN}`,
    question: "What share of all observations was classified correctly?",
    interpretation:
      "Accuracy is easy to understand but can mislead when one class dominates: a model that always predicts the majority class can look accurate while failing on the minority class. Read it alongside precision, recall and F1.",
  },
  {
    key: "precision",
    title: "Precision",
    formula: "TP / (TP + FP)",
    tex: String.raw`\text{Precision}=\dfrac{TP}{TP+FP}`,
    question: "Of everything predicted positive, what fraction is truly positive?",
    interpretation:
      "High precision means positive predictions are usually correct. It matters when false alarms are expensive, for example when every flagged item needs a costly manual investigation.",
  },
  {
    key: "recall",
    title: "Recall (Sensitivity)",
    formula: "TP / (TP + FN)",
    tex: String.raw`\text{Recall}=\dfrac{TP}{TP+FN}`,
    question: "Of all actual positives, what fraction did the model detect?",
    interpretation:
      "Recall, also called sensitivity or the true positive rate, is high when few positive cases are missed. It matters in initial safety screening, where missing a real fault is costly.",
  },
  {
    key: "f1",
    title: "F1-Score",
    formula: "2PR / (P + R)",
    tex: String.raw`F_1=\dfrac{2\,P\,R}{P+R}=\dfrac{2TP}{2TP+FP+FN}`,
    question: "How well are precision and recall balanced?",
    interpretation:
      "F1 is the harmonic mean of precision and recall, useful when both matter. It does not include TN directly, so it focuses on the positive class.",
  },
  {
    key: "specificity",
    title: "Specificity",
    formula: "TN / (TN + FP)",
    tex: String.raw`\text{Specificity}=\dfrac{TN}{TN+FP}`,
    question: "Of all actual negatives, what fraction was correctly identified?",
    interpretation:
      "Specificity, the true negative rate, complements recall by describing performance on the negative class. Reporting both gives a more balanced view.",
  },
];

export const ERROR_RATE = {
  formula: "(FP + FN) / TOTAL",
  tex: String.raw`\text{Error rate}=\dfrac{FP+FN}{\text{Total}}=1-\text{Accuracy}`,
};

/* ------------------------------------------------------------- mathematics */
export const CONCEPTS: { id: string; n: string; title: string; short: string; body: string[]; tex?: string[] }[] = [
  {
    id: "models",
    n: "5.1",
    title: "Classification models",
    short: "x → f(x) → ŷ",
    body: [
      "A classification model maps an input feature vector to a discrete class. A trained model f takes an observation x and produces a predicted class ŷ.",
      "In binary classification the labels are often 0 and 1; in multiclass classification they may be A, B, C and so on. Examples include spam detection, image recognition, fault diagnosis, credit-risk screening and quality inspection. In every case the prediction is compared with a reference label to estimate performance.",
    ],
    tex: [String.raw`\mathbf{x}=[x_1,\,x_2,\,\dots,\,x_p],\qquad \hat{y}=f(\mathbf{x})`],
  },
  {
    id: "split",
    n: "5.2",
    title: "Training and testing",
    short: "learn on one part, judge on another",
    body: [
      "A dataset is commonly divided into a training portion and a testing portion. The model learns patterns from the training set; the test set is kept separate and estimates performance on observations not used for fitting.",
      "If the test data repeatedly influences model design, the estimate becomes overly optimistic. The confusion matrix is computed after predictions are made: it does not train a classifier, it evaluates the relationship between actual and predicted labels.",
    ],
  },
  {
    id: "matrices",
    n: "5.3",
    title: "Matrices in machine learning",
    short: "X ∈ ℝⁿˣᵖ, y, ŷ",
    body: [
      "A matrix is a rectangular arrangement of values in rows and columns; with m rows and n columns its order is m × n. Matrices store datasets, represent transformations and organise counts.",
      "A feature dataset is a matrix X with n observations (rows) and p features (columns). A label vector y stores the actual class of each observation and ŷ stores the predicted class.",
      "With rows for actual classes and columns for predicted classes, row totals give the number of actual examples in each class and column totals give the number of predictions for each class. Always check the axis convention: some software and texts order the axes differently.",
    ],
    tex: [String.raw`X\in\mathbb{R}^{\,n\times p},\qquad \mathbf{y}\in\{0,1\}^n,\qquad \hat{\mathbf{y}}\in\{0,1\}^n`],
  },
  {
    id: "confusion",
    n: "5.4",
    title: "The confusion matrix",
    short: "diagonal = correct",
    body: [
      "A confusion matrix is a table that compares actual labels with predicted labels. In a binary problem it has four cells. On this site rows are actual labels and columns are predicted labels.",
      "The diagonal cells, TP and TN, are correct predictions; the off-diagonal cells, FP and FN, are errors. The matrix matters because two models with equal accuracy can make different types of mistakes.",
      "The positive class must be chosen deliberately: in defect detection “defective” may be positive, in spam filtering “spam” may be positive. Changing the positive class changes what TP, FP, FN, precision and recall mean.",
      "TP is a positive case correctly predicted positive; TN is a negative case correctly predicted negative (not simply a negative prediction). FP is a negative predicted positive, a false alarm; FN is a positive predicted negative, a miss. Neither error is universally worse.",
    ],
    tex: [String.raw`C=\begin{bmatrix}TP & FN\\ FP & TN\end{bmatrix}\qquad C_{ij}=\#\{\text{actual}=i,\ \text{predicted}=j\}`],
  },
  {
    id: "types",
    n: "5.5",
    title: "Binary, multiclass, multilabel",
    short: "2×2 · k×k · one decision per label",
    body: [
      "Binary classification has exactly two classes, such as pass/fail or spam/not spam, and a 2 × 2 matrix whose cells are named TP, TN, FP and FN.",
      "Multiclass classification has three or more mutually exclusive classes, such as a machine fault being a bearing, motor or sensor failure. Its matrix is k × k, with one row and one column per class; class-specific counts come from treating one class as positive and the rest as negative (one-versus-rest).",
      "A multilabel task is different: one observation may carry several labels at once, so it needs a separate binary decision for each label. Metric formulas and averaging choices must match the structure of the task.",
    ],
  },
];

export const CONSTRUCTION = {
  steps: [
    "Decide the class order and identify the positive class.",
    "Compare each actual label with its paired predicted label.",
    "Add exactly one to one cell for every observation.",
  ],
  rules: [
    ["Actual positive, predicted positive", "TP"],
    ["Actual positive, predicted negative", "FN"],
    ["Actual negative, predicted positive", "FP"],
    ["Actual negative, predicted negative", "TN"],
  ] as const,
};

/* -------------------------------------------------------------------- lab */
export const CELL_INFO = {
  tp: { short: "TP", name: "True positive", def: "Positive cases the model correctly flagged", kind: "correct" },
  fn: { short: "FN", name: "False negative", def: "Positive cases the model missed", kind: "miss" },
  fp: { short: "FP", name: "False positive", def: "Negative cases flagged by mistake (false alarms)", kind: "alarm" },
  tn: { short: "TN", name: "True negative", def: "Negative cases correctly let through", kind: "correct" },
} as const;

export const EVALUATOR_CALLOUT = {
  title: "Think like a model evaluator",
  body: "A single score can hide important mistakes. Read the whole matrix, then choose the metric that fits the cost of each error.",
};

export const THRESHOLD_CAPTION =
  "Precision and recall often trade off as the decision threshold moves: raising the threshold for a positive prediction may improve precision while reducing recall. The right balance depends on the application.";

export const AVERAGING = [
  { key: "macro", title: "Macro", body: "Compute the metric for each class, then take the plain mean: every class counts equally." },
  { key: "micro", title: "Micro", body: "Add up TP, FP and FN across all classes first, then compute the metric once. For single-label multiclass, micro F1 equals accuracy." },
  { key: "weighted", title: "Weighted", body: "Average the per-class metrics weighted by each class's support (its number of actual examples)." },
] as const;

export const MULTICLASS_DEFAULT = {
  classes: ["Bearing", "Motor", "Sensor"],
  matrix: [
    [30, 4, 2],
    [6, 25, 2],
    [1, 5, 25],
  ],
};

/* ---------------------------------------------------------------- compare */
export const COMPARE = {
  headline: ["Same accuracy.", "Different mistakes."],
  intro:
    "Two hypothetical models are tested on the same 100 observations, with 45 actual positives and 55 actual negatives. Both classify 80 of them correctly.",
  missFirst:
    "If missing a positive case is the main concern, as in early detection of a hazardous fault, Model B may be preferred: it has fewer false negatives and higher recall, so it is worth further investigation.",
  alarmFirst:
    "If every false alarm triggers an expensive shutdown and inspection, Model A may be preferable: it has higher precision and specificity, so its positive predictions are more reliable.",
  noWinner:
    "There is no universal winner. A fair comparison uses the same held-out observations and a metric aligned with the application; repeated validation may be needed to understand variability.",
  f1Note:
    "The report prints Model B's F1-score as 80.81%. Computing it from the counts gives 2·40 / (2·40 + 15 + 5) = 80/100, so this site shows the computed value.",
};

export const QUOTE = {
  lines: ["Two models with equal", "accuracy can make different", "types of mistakes."],
  body: [
    "Accuracy alone can hide meaningful differences between models.",
    "Choose the metric by the consequences of each error in the application.",
  ],
};

/* ----------------------------------------------------------- applications */
export const APPLICATIONS: { id: string; title: string; positive: string; body: string; fp: string; fn: string; caveat?: string }[] = [
  {
    id: "manufacturing",
    title: "Manufacturing",
    positive: "Positive = defective",
    body: "Classify products as defective or acceptable on the inspection line.",
    fp: "An acceptable item is sent for unnecessary inspection, rework or rejection.",
    fn: "A defective item passes inspection and reaches the customer.",
  },
  {
    id: "healthcare",
    title: "Healthcare support",
    positive: "Positive = needs follow-up",
    body: "A screening model classifies whether a test result requires follow-up. High recall can reduce missed cases.",
    fp: "A patient is sent for a follow-up test they did not need.",
    fn: "A case that needed follow-up is missed.",
    caveat: "The model must not replace professional diagnosis and requires careful validation.",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    positive: "Positive = suspicious event",
    body: "Classify network events as suspicious or normal. A detector may prefer fewer false negatives to avoid missing threats.",
    fp: "A normal event raises an alert and adds to analyst workload.",
    fn: "An attack goes undetected.",
  },
  {
    id: "agriculture",
    title: "Agriculture & environment",
    positive: "Positive = possible disease / abnormal reading",
    body: "Classify plant images for possible disease, or flag sensor readings that indicate abnormal conditions. Performance can vary with lighting, season, equipment and location.",
    fp: "A healthy plant or normal reading is flagged and checked for nothing.",
    fn: "A diseased plant or abnormal condition goes unnoticed.",
  },
  {
    id: "spam",
    title: "Spam filtering",
    positive: "Positive = spam",
    body: "An email system classifies messages as spam or not spam. Choosing “spam” as the positive class fixes what each cell means.",
    fp: "A genuine email is sent to the spam folder and may never be read.",
    fn: "A spam message reaches the inbox.",
  },
];

export const TOOLS = ["Python", "scikit-learn", "NumPy", "Matplotlib", "MATLAB", "Jupyter", "Google Colab"];

/* ------------------------------------------------------------------- code */
export const CODE_NOTES = {
  python: {
    what: "Builds the report's 100 actual and predicted labels (1 = defective, the positive class), then asks scikit-learn for the confusion matrix and a per-class report. With labels=[0, 1], the first row is actual negative and the second is actual positive.",
    output: [
      "[[44 11]",
      " [ 9 36]]",
      "              precision    recall  f1-score   support",
      "",
      "           0       0.83      0.80      0.81        55",
      "           1       0.77      0.80      0.78        45",
      "",
      "    accuracy                           0.80       100",
      "   macro avg       0.80      0.80      0.80       100",
      "weighted avg       0.80      0.80      0.80       100",
    ].join("\n"),
  },
  scratch: {
    what: "Unpacks the four cells and computes every metric by hand. Each conditional returns 0 when a denominator is zero: a reporting convention for this demonstration, not a claim that the undefined ratio equals 0.",
    output:
      "Accuracy: 0.8\nError rate: 0.2\nPrecision: 0.7659574468085106\nRecall: 0.8\nF1-score: 0.7826086956521738\nSpecificity: 0.8",
  },
  heatmap: {
    what: "Draws the matrix as a heatmap. Colour intensity makes large and small counts easy to compare, but the numbers stay printed in each cell because colour alone is not an exact measurement.",
    output: "A 2 × 2 heatmap titled “Confusion Matrix - Sample Classifier”, darkest on the diagonal (44 and 36).",
  },
  matlab: {
    what: "MATLAB's confusionmat builds the same count matrix from the same illustrative labels. Always print the returned class order before reading the cells.",
    output: "     0     1\n\n    44    11\n     9    36",
  },
  ravel:
    "Pitfall: for labels [0, 1], cm.ravel() unpacks in row-major order [[TN, FP], [FN, TP]], so the variables must be assigned tn, fp, fn, tp. Any other order silently feeds the wrong counts into every formula.",
};

/* ---------------------------------------------------------------- results */
export const RESULTS = {
  intro:
    "The sample has 100 observations: 45 actual positives and 55 actual negatives. The classifier correctly detects 36 positives and 44 negatives, misses 9 positives and incorrectly flags 11 negatives.",
  interpretations: {
    accuracy: (c: number, t: number) => `${c} of ${t} predictions are correct.`,
    errorRate: (i: number, t: number) => `${i} of ${t} predictions are incorrect.`,
    precision: () => "Share of positive predictions that are truly positive.",
    recall: () => "Share of actual positive cases the model detects.",
    f1: () => "Harmonic balance of precision and recall.",
    specificity: () => "Share of actual negatives correctly identified.",
  },
  caveat:
    "These metrics show moderate-to-good performance on a small example, but they are not enough to establish that a real system is safe or suitable. The sample is illustrative, with no uncertainty interval and no independent real-world validation. A deployment decision needs representative data, class prevalence and error costs, and a threshold chosen for the intended use.",
  heatmap:
    "As a heatmap, the largest cells lie on the diagonal (TN and TP), showing more correct than incorrect predictions; the off-diagonal cells identify the two error types. A heatmap is a visual aid, not a substitute for reading the values and metric definitions.",
};

export const CONCLUSION = [
  "This activity connected matrices and ratios with the evaluation of classification models. The confusion matrix organises the relationship between actual and predicted labels into interpretable counts.",
  "Comparing two models showed that accuracy alone may hide meaningful differences: a model with higher recall can detect more positive cases while raising more false alarms. Metric selection should follow the consequences of each error in the application.",
  "Python and MATLAB automate the calculations, but correct interpretation still depends on class order, label definitions, data quality and validation design. Used with its limits in mind, the confusion matrix is a simple but powerful tool for understanding classifier behaviour.",
];

export const FUTURE: { title: string; body: string; tab?: "labels" | "threshold" | "multiclass" | "counts" }[] = [
  {
    title: "Real, documented data",
    body: "Use a real, ethically sourced dataset from manufacturing or sensor monitoring, cleaned and split into training, validation and test sets without data leakage.",
  },
  {
    title: "Multiclass averaging",
    body: "Extend to multiclass confusion matrices with macro, micro and weighted averaging, for systems that must recognise several fault types or product categories.",
    tab: "multiclass",
  },
  {
    title: "Thresholds, PR and ROC",
    body: "Show how performance changes with the decision threshold using precision–recall and ROC curves, without letting them replace application-specific evaluation.",
    tab: "threshold",
  },
  {
    title: "Cost and uncertainty",
    body: "Assign different penalties to false positives and false negatives, and quantify uncertainty with confidence intervals or repeated cross-validation.",
  },
  {
    title: "Interactive dashboard",
    body: "Accept actual and predicted labels, build the confusion matrix, calculate the metrics and show a labelled heatmap, with privacy, fairness, safety and monitoring checks for any deployment.",
    tab: "labels",
  },
];

/* ----------------------------------------------------------------- footer */
export const TEAM = [
  { name: "Vaishnavi Sahu", role: "Introduction, problem statement and framing, report layout" },
  { name: "U Nandini", role: "Project objectives, data collection, dataset sourcing and structuring" },
  { name: "Srushti Sachin Gaikwad", role: "Matrix mathematics framework, equation derivations, metric definitions" },
  { name: "Tanvi Santosh More", role: "Program coding (Python/MATLAB), classifier evaluation implementation" },
  { name: "Syed Mohammed Varis", role: "Matrix calculation execution, heatmaps, evaluation plot generation" },
  { name: "Thanya Vaarshini M", role: "Results analysis, matrix interpretation, conclusion drafting" },
  { name: "Thanguturu Sai Ritvik Kumar", role: "Future scope formulation, reference compilation, final accuracy check" },
];

export const REFERENCES: { text: string; url?: string }[] = [
  {
    text: "Scikit-learn Developers. “confusion_matrix — scikit-learn documentation.”",
    url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html",
  },
  {
    text: "Scikit-learn Developers. “Model evaluation: quantifying the quality of predictions.”",
    url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
  },
  {
    text: "Google for Developers. “Classification — Machine Learning Crash Course.”",
    url: "https://developers.google.com/machine-learning/crash-course/classification",
  },
  { text: "Géron, A. Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow. 3rd ed., O'Reilly Media, 2022." },
  { text: "Bishop, C. M. Pattern Recognition and Machine Learning. Springer, 2006." },
  { text: "Fawcett, T. “An introduction to ROC analysis.” Pattern Recognition Letters, vol. 27, no. 8, 2006, pp. 861–874." },
  {
    text: "Powers, D. M. W. “Evaluation: From Precision, Recall and F-Measure to ROC, Informedness, Markedness & Correlation.” Journal of Machine Learning Technologies, 2(1), 2011, pp. 37–63.",
  },
];

export const ILLUSTRATIVE_NOTE =
  "The numerical dataset and model-comparison values are illustrative examples created for learning. The web documentation links are implementation and terminology references.";
