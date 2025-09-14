import React, { useState } from "react";
import { activities } from "../data/activities";

const questions = [
  {
    q: "What’s your ideal Saturday morning?",
    a: [
      { txt: "Jog in the park", type: "adventure" },
      { txt: "Reading a book", type: "relax" },
      { txt: "Brunch with friends", type: "social" },
      { txt: "Working on a hobby", type: "hobbies" },
    ],
  },
  {
    q: "Pick a Saturday night vibe:",
    a: [
      { txt: "Big party!", type: "party" },
      { txt: "Cozy movie night", type: "relax" },
      { txt: "Concert or event", type: "adventure" },
      { txt: "Game night with friends", type: "social" },
    ],
  },
  {
    q: "Which snack calls your name?",
    a: [
      { txt: "Smoothie", type: "wellness" },
      { txt: "Pizza", type: "party" },
      { txt: "Salad", type: "wellness" },
      { txt: "Cupcakes", type: "social" },
    ],
  },
  {
    q: "Your dream weekend trip would be...",
    a: [
      { txt: "Camping in the wild", type: "adventure" },
      { txt: "Spa retreat", type: "relax" },
      { txt: "Food tour", type: "social" },
      { txt: "Art & culture city tour", type: "hobbies" },
    ],
  },
  {
    q: "What’s your go-to stress buster?",
    a: [
      { txt: "Dancing", type: "party" },
      { txt: "Yoga", type: "relax" },
      { txt: "Exploring nature", type: "adventure" },
      { txt: "Cooking", type: "hobbies" },
    ],
  },
];

const PERSONAS = {
  adventure: {
    label: "The Adventurer",
    desc: "You love outdoors, action, and new experiences.",
    categories: ["Outdoor & Adventure", "Fitness & Sports"],
  },
  relax: {
    label: "The Relaxer",
    desc: "Chill, unwind, and enjoy the little things.",
    categories: ["Wellness", "Learning & Hobbies"],
  },
  social: {
    label: "The Socialite",
    desc: "Weekends are made for friends, food, and fun.",
    categories: ["Food & Dining", "Events & Nightlife"],
  },
  hobbies: {
    label: "The Creator",
    desc: "You thrive on creativity and learning new things.",
    categories: ["Learning & Hobbies", "Wellness"],
  },
  party: {
    label: "The Party Starter",
    desc: "You bring the energy wherever you go!",
    categories: ["Events & Nightlife", "Fitness & Sports"],
  },
  wellness: {
    label: "The Wellness Guru",
    desc: "Mind, body, and soul come first.",
    categories: ["Wellness", "Food & Dining"],
  },
};

export default function WeekendQuizModal({ onSuggest, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  function pickAnswer(ans) {
    setAnswers([...answers, ans.type]);
    setStep(step + 1);
  }

  if (step < questions.length) {
    const q = questions[step];
    return (
      <div className="quiz-modal-bg">
        <div className="quiz-modal-card">
          <button className="close-quiz-btn" onClick={onClose}>×</button>
          <h2>🎭 Weekend Personality Quiz</h2>
          <h3 style={{margin:"18px 0 10px"}}>{q.q}</h3>
          <div className="quiz-answers">
            {q.a.map((ans, i) => (
              <button
                key={i}
                className="quiz-answer-btn"
                onClick={() => pickAnswer(ans)}
              >
                {ans.txt}
              </button>
            ))}
          </div>
          <div style={{marginTop:24, color:"#aaa"}}>Step {step+1} of {questions.length}</div>
        </div>
      </div>
    );
  }

  // Calculate persona
  const counts = {};
  answers.forEach(type => { counts[type] = (counts[type] || 0) + 1; });
  const mainType = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  const persona = PERSONAS[mainType];

  // Recommend activities from categories
  const suggestions = activities
    .filter(cat => persona.categories.includes(cat.name))
    .flatMap(cat => cat.items.map(item => ({
      ...item,
      id: `${cat.id}-${item.id}`,
      category: cat.name,
      icon: cat.icon,
      name: item.name,
    })))
    .slice(0, 6); // limit

  return (
    <div className="quiz-modal-bg">
      <div className="quiz-modal-card">
        <button className="close-quiz-btn" onClick={onClose}>×</button>
        <h2>🎉 Your Weekend Persona: <b>{persona.label}</b></h2>
        <div style={{fontSize:18, marginBottom:8}}>{persona.desc}</div>
        <div style={{fontWeight:500, marginTop:12, fontSize:17}}>Suggested activities for you:</div>
        <ul style={{margin:"18px 0", fontSize:16, listStyle:"none", padding:0}}>
          {suggestions.map(act =>
            <li key={act.id} style={{margin: "6px 0"}}>
              <span style={{fontSize:"1.2em", marginRight:8}}>{act.icon}</span>
              {act.name} <span style={{color:"#aaa", fontSize:14}}>({act.category})</span>
            </li>
          )}
        </ul>
        <button
          style={{
            background: "#34d399",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "10px 30px",
            fontSize: "1.1em",
            fontWeight: 600,
            marginTop: 8
          }}
          onClick={() => onSuggest(suggestions)}
        >
          Add these to my plan!
        </button>
        <button
          style={{
            background: "#fff",
            color: "#888",
            border: "1.5px solid #bbb",
            borderRadius: "10px",
            padding: "7px 20px",
            fontWeight: 500,
            marginLeft: 10
          }}
          onClick={onClose}
        >
          Skip
        </button>
      </div>
    </div>
  );
}