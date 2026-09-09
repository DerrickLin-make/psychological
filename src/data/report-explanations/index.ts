import { aasRExplanation } from "./aas-r";
import { bdiIiExplanation } from "./bdi-ii";
import { bat23Explanation } from "./bat-23";
import { cbiExplanation } from "./cbi";
import { dass21Explanation } from "./dass-21";
import { epdsExplanation } from "./epds";
import { erqExplanation } from "./erq";
import { fadExplanation } from "./fad";
import { ffmq39Explanation } from "./ffmq-39";
import { gad7Explanation } from "./gad-7";
import { gseExplanation } from "./gse";
import { ipipBig5Explanation } from "./ipip-big5-50";
import { maritalAdjustmentExplanation } from "./marital-adjustment";
import { mbtiExplanation } from "./mbti";
import { mosSocialExplanation } from "./mos-social";
import { neoFfiExplanation } from "./neo-ffi";
import { pcl5Explanation } from "./pcl-5";
import { phq9Explanation } from "./phq-9";
import { psqiExplanation } from "./psqi";
import { sasExplanation } from "./sas";
import { scl90Explanation } from "./scl-90";
import { sdsExplanation } from "./sds";
import type { ScaleExplanation } from "./types";

export * from "./types";

export const reportExplanations: Record<string, ScaleExplanation> = {
  "aas-r": aasRExplanation,
  "pcl-5": pcl5Explanation,
  psqi: psqiExplanation,
  mbti: mbtiExplanation,
  "neo-ffi": neoFfiExplanation,
  "marital-adjustment": maritalAdjustmentExplanation,
  fad: fadExplanation,
  sds: sdsExplanation,
  sas: sasExplanation,
  epds: epdsExplanation,
  "scl-90": scl90Explanation,
  "bdi-ii": bdiIiExplanation,
  "dass-21": dass21Explanation,
  "phq-9": phq9Explanation,
  "gad-7": gad7Explanation,
  gse: gseExplanation,
  cbi: cbiExplanation,
  "bat-23": bat23Explanation,
  "ipip-big5-50": ipipBig5Explanation,
  "ffmq-39": ffmq39Explanation,
  erq: erqExplanation,
  "mos-social": mosSocialExplanation,
};
