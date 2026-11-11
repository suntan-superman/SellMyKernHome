"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { buildSellingQuizSummary, getSellingQuizResult, SELLING_QUIZ_CONTEXT_KEY, sellingQuizQuestions } from "@/lib/selling-quiz";

export default function SellingOptionsQuiz() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [includeContext, setIncludeContext] = useState(false);
  const [contextSummary, setContextSummary] = useState("");
  const started = useRef(false);
  const question = sellingQuizQuestions[step];

  function chooseAnswer(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    if (!started.current) {
      started.current = true;
      track("selling_quiz_start", { location: "selling_options_quiz" });
    }
  }

  function next() {
    if (!answers[question.id]) return;
    if (step < sellingQuizQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    const completedResult = getSellingQuizResult(answers);
    setResult(completedResult);
    setContextSummary(buildSellingQuizSummary(answers));
    track("selling_quiz_complete", { location: "selling_options_quiz" });
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setResult(null);
    setIncludeContext(false);
    setContextSummary("");
    started.current = false;
    window.sessionStorage.removeItem(SELLING_QUIZ_CONTEXT_KEY);
  }

  function prepareInquiry() {
    if (includeContext && contextSummary.trim()) window.sessionStorage.setItem(SELLING_QUIZ_CONTEXT_KEY, contextSummary.trim().slice(0, 800));
    else window.sessionStorage.removeItem(SELLING_QUIZ_CONTEXT_KEY);
    track("selling_quiz_cta_click", { location: "selling_quiz_results", destination: "/#property-form" });
  }

  if (result) return <section className="quiz-shell quiz-results" aria-labelledby="quiz-result-title">
    <div className="quiz-result-heading"><CheckCircle2 aria-hidden="true" /><div><p className="eyebrow">YOUR RESULT</p><h2 id="quiz-result-title">{result.title}</h2></div></div>
    <p>{result.explanation}</p>
    <div className="quiz-alternatives"><h3>Other paths worth considering</h3><ul>{result.alternatives.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul></div>
    <nav className="quiz-resource-links" aria-label="Educational resources"><h3>Helpful next steps</h3><ul>{result.links.map(([href, label]) => <li key={href}><Link href={href}>{label} <ArrowRight size={16} /></Link></li>)}<li><Link href="/selling-situations">Explore selling situations <ArrowRight size={16} /></Link></li></ul></nav>
    <p className="quiz-disclaimer">This free tool provides general educational information based on your answers. It does not determine your property&apos;s value, establish legal ownership, or recommend a specific transaction. Research your options and consult qualified professionals before making decisions.</p>
    <div className="quiz-inquiry-option">
      <label className="check-field"><input type="checkbox" checked={includeContext} onChange={(event) => setIncludeContext(event.target.checked)} /><span>Include my quiz answers with my inquiry.</span></label>
      {includeContext ? <div className="quiz-summary-preview"><label htmlFor="quiz-summary">Review or edit the summary before continuing</label><textarea id="quiz-summary" rows="8" maxLength="800" value={contextSummary} onChange={(event) => setContextSummary(event.target.value)} /><small>This stays in this browser session and is submitted only if you complete the existing inquiry form under its displayed consent requirements.</small></div> : null}
    </div>
    <div className="quiz-actions"><button className="button button-secondary" type="button" onClick={restart}><RotateCcw size={17} /> Restart quiz</button><Link className="button" href="/#property-form" onClick={prepareInquiry}>Tell Us About Your Property <ArrowRight size={17} /></Link></div>
  </section>;

  return <section className="quiz-shell" aria-labelledby="quiz-question">
    <div className="quiz-progress"><div><span aria-live="polite">Question {step + 1} of {sellingQuizQuestions.length}</span><strong>{Math.round(((step + 1) / sellingQuizQuestions.length) * 100)}%</strong></div><progress max={sellingQuizQuestions.length} value={step + 1} aria-label={`Quiz progress: question ${step + 1} of ${sellingQuizQuestions.length}`} /></div>
    <fieldset className="quiz-question"><legend id="quiz-question">{question.legend}</legend><div className="quiz-answers">{question.answers.map(([value, label]) => <label className={answers[question.id] === value ? "quiz-answer is-selected" : "quiz-answer"} key={value}><input type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => chooseAnswer(value)} /><span>{label}</span></label>)}</div></fieldset>
    <div className="quiz-actions"><button className="button button-secondary" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ArrowLeft size={17} /> Back</button><button className="button" type="button" onClick={next} disabled={!answers[question.id]}>{step === sellingQuizQuestions.length - 1 ? "See My Results" : "Next"} <ArrowRight size={17} /></button></div>
  </section>;
}
