// import React, { useState } from "react";
// import { activities as categories } from "../data/activities";
// import { usePlan } from "../context/PlanContext";

// function getSuggestions(type) {
//   const map = {
//     adventure: ["outdoor", "fitness", "travel", "events"],
//     relax: ["wellness", "hobbies", "outdoor", "food"],
//     social: ["food", "events", "family", "entertainment"],
//     party: ["events", "food", "entertainment", "travel"],
//     creative: ["hobbies", "entertainment", "food", "family"],
//     wellness: ["wellness", "food", "outdoor", "travel"],
//     romantic: ["food", "travel", "wellness", "entertainment"],
//     curious: ["hobbies", "travel", "entertainment", "family"],
//     family: ["food", "family", "outdoor", "hobbies"]
//   };

//   const cats = map[type] || [];
//   return categories
//     .filter(cat => cats.includes(cat.id)) // <-- FIX: use cat.id, not cat.name!
//     .flatMap(cat =>
//       cat.items.map(item => ({
//         ...item,
//         icon: cat.icon,
//         category: cat.name
//       }))
//     )
//     .slice(0, 3);
// }
// const initialBotMsg = {
//   type: "bot",
//   text: "Hi! 👋 Want help picking activities? What kind of weekend are you planning? (Adventure, Relax, Social, Party, Creative, Wellness...)"
// };

// export default function RecommenderChatbot() {
//   const [chat, setChat] = useState([initialBotMsg]);
//   const [input, setInput] = useState("");
//   const [step, setStep] = useState(0);
//   const { selectedDays, addActivity } = usePlan();

//   function handleUserInput(e) {
//     e.preventDefault();
//     if (!input.trim()) return;
//     const userMsg = { type: "user", text: input.trim() };
//     setChat(prev => [...prev, userMsg]);
//     handleBotReply(input.trim().toLowerCase());
//     setInput("");
//   }

//   function handleBotReply(msg) {
//   // Synonym/intent mapping
//   let type = null;
//   if (/adventure|adventurous|hike|trek|explore/i.test(msg)) type = "adventure";
//   else if (/relax|chill|calm|spa/i.test(msg)) type = "relax";
//   else if (/social|friends|family|group|meet/i.test(msg)) type = "social";
//   else if (/party|night out|club|dj|dance/i.test(msg)) type = "party";
//   else if (/creative|create|art|music|paint/i.test(msg)) type = "creative";
//   else if (/wellness|health|yoga|meditate/i.test(msg)) type = "wellness";
//   else if (/romantic|date|love|couple/i.test(msg)) type = "romantic";
//   else if (/curious|learn|study|discover/i.test(msg)) type = "curious";
//   else if (/food|eat|snack|dinner|lunch|brunch|dessert/i.test(msg)) type = "food";
//   else if (/family|kids|child|children/i.test(msg)) type = "family";

//   if (type) {
//     const suggestions = getSuggestions(type);
//     if (suggestions.length > 0) {
//       setChat(prev => [
//         ...prev,
//         {
//           type: "bot",
//           text: `Awesome, here's what you might like:`,
//           suggestions,
//           typeKey: type
//         }
//       ]);
//     } else {
//       setChat(prev => [
//         ...prev,
//         {
//           type: "bot",
//           text: "Sorry, I couldn't find any activities for that. Try another mood or type!"
//         }
//       ]);
//     }
//     setStep(1);
//   } else {
//     setChat(prev => [
//       ...prev,
//       {
//         type: "bot",
//         text: "Tell me more (or type another mood, or ask for more ideas)!"
//       }
//     ]);
//   }
// }
//   function handleAdd(act) {
//     // Add activity to the first day, morning slot (example; you can prompt for slot)
//     if (!selectedDays.length) return;
//     addActivity(selectedDays[0], "morning", act);
//     setChat(prev => [
//       ...prev,
//       { type: "bot", text: `✅ "${act.name}" added to your plan! Want more ideas?` }
//     ]);
//     setStep(1);
//   }

//   // Simple sidebar/chat widget style
//   return (
//     <div className="chatbot-widget">
//       <div className="chatbot-header">💡 Smart Recommender</div>
//       <div className="chatbot-body">
//         {chat.map((msg, i) =>
//           <div key={i} className={`chat-msg ${msg.type}`}>
//             <div>
//               {msg.text}
//               {msg.suggestions && (
//                 <ul className="suggestion-list">
//                   {msg.suggestions.map((act, idx) =>
//                     <li key={idx}>
//                       <span style={{marginRight:8}}>{act.icon}</span>
//                       <span>{act.name}</span>
//                       <button className="add-suggestion-btn" onClick={() => handleAdd(act)}>
//                         ➕ Add
//                       </button>
//                     </li>
//                   )}
//                 </ul>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//       <form className="chatbot-input-bar" onSubmit={handleUserInput}>
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           placeholder="Type your reply or ask for ideas..."
//         />
//         <button type="submit">Send</button>
//       </form>
//     </div>
//   );
// }



import React, { useState } from "react";
import { activities as categories } from "../data/activities";
import { usePlan } from "../context/PlanContext";

// --- Build activity keyword map (same as before, but you can expand with more synonyms!) ---
const keywordMap = {};
categories.forEach(cat => {
  cat.items.forEach(item => {
    keywordMap[item.name.toLowerCase()] = {
      ...item,
      icon: cat.icon,
      category: cat.name,
    };
    // Synonyms/examples:
    if (item.name.toLowerCase().includes("night") || cat.name.toLowerCase().includes("night")) {
      ["night", "night out", "party", "clubbing"].forEach(k => keywordMap[k] = keywordMap[item.name.toLowerCase()]);
    }
    if (item.name.toLowerCase().includes("food") || cat.name.toLowerCase().includes("food")) {
      ["food", "eat", "snack", "dinner", "brunch", "lunch", "dessert"].forEach(k => keywordMap[k] = keywordMap[item.name.toLowerCase()]);
    }
    if (item.name.toLowerCase().includes("movie") || cat.name.toLowerCase().includes("entertainment")) {
      ["movie", "movies", "film", "cinema", "night out"].forEach(k => keywordMap[k] = keywordMap[item.name.toLowerCase()]);
    }
  });
});

const categoryMap = {
  adventure: ["outdoor", "fitness", "travel", "events"],
  relax: ["wellness", "hobbies", "outdoor", "food"],
  social: ["food", "events", "family", "entertainment"],
  party: ["events", "food", "entertainment", "travel"],
  creative: ["hobbies", "entertainment", "food", "family"],
  wellness: ["wellness", "food", "outdoor", "travel"],
  romantic: ["food", "travel", "wellness", "entertainment"],
  curious: ["hobbies", "travel", "entertainment", "family"],
  family: ["food", "family", "outdoor", "hobbies"]
};

const funnyReplies = [
  "I double dare you to try this one! 😜",
  "If you do this, send me a selfie! 🤳",
  "This one's a classic. Don't forget your hat! 🎩",
  "Warning: May cause extreme fun! 🚨",
  "Legend says this activity brings good luck. 🍀",
  "I once tried this and survived to tell the tale! 😁",
  "Careful, you might have TOO much fun! 😏",
  "Adventure awaits... will you answer the call? 📞",
  "You + this = Epic weekend! 💥",
  "Your future self will high-five you for this! 🙌"
];

const funFacts = [
  "🎬 Did you know? Watching movies with friends increases happiness by 34%.",
  "🍳 Brunch was invented by people who couldn't decide between breakfast and lunch!",
  "🏞️ Hiking is scientifically proven to boost creativity.",
  "🧘 Meditation can make you feel as chill as a cucumber.",
  "🎉 Dancing burns about 200 calories an hour. So, party on!"
];

function getRandomFunnyReply() {
  return funnyReplies[Math.floor(Math.random() * funnyReplies.length)];
}
function getRandomFunFact() {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}

function getSuggestionsByMood(mood) {
  const cats = categoryMap[mood] || [];
  return categories
    .filter(cat => cats.includes(cat.id))
    .flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        icon: cat.icon,
        category: cat.name
      }))
    )
    .slice(0, 3);
}

function getSuggestionsByKeywords(msg) {
  let found = [];
  const lowered = msg.toLowerCase();
  Object.keys(keywordMap).forEach(key => {
    if (lowered.includes(key) && !found.find(f => f.name === keywordMap[key].name)) {
      found.push(keywordMap[key]);
    }
  });
  if (found.length === 0) {
    Object.keys(categoryMap).forEach(mood => {
      if (lowered.includes(mood)) {
        found = getSuggestionsByMood(mood);
      }
    });
  }
  if (found.length === 0) {
    if (/night/.test(lowered)) {
      found = getSuggestionsByMood("party");
    } else if (/morning/.test(lowered)) {
      found = getSuggestionsByMood("wellness");
    }
  }
  if (found.length === 0) {
    const allActs = categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        icon: cat.icon,
        category: cat.name
      }))
    );
    found = allActs.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
  return found;
}

const initialBotMsg = {
  type: "bot",
  text: "😎 Yo! I'm your Weekend Wizard. Tell me your mood, dream, or just type any activity (eg: 'adventure', 'movie', 'party', 'karaoke', 'cycling', or even 'surprise me'!)",
};

export default function RecommenderChatbot() {
  const [chat, setChat] = useState([initialBotMsg]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const { selectedDays, addActivity } = usePlan();

  function handleUserInput(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { type: "user", text: input.trim() };
    setChat(prev => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      handleBotReply(input.trim());
      setTyping(false);
    }, 800 + Math.random() * 700); // Simulate "thinking"
    setInput("");
  }

  function handleBotReply(msg) {
    // Easter egg for "surprise me"
    if (/surprise/.test(msg.toLowerCase())) {
      const allActs = categories.flatMap(cat =>
        cat.items.map(item => ({
          ...item,
          icon: cat.icon,
          category: cat.name
        }))
      );
      const picks = allActs.sort(() => 0.5 - Math.random()).slice(0, 3);
      setChat(prev => [
        ...prev,
        { type: "bot", text: "🎲 Surprise time! Try one of these:", suggestions: picks }
      ]);
      if (Math.random() > 0.7) {
        setChat(prev => [...prev, { type: "bot", text: getRandomFunFact() }]);
      }
      return;
    }

    const suggestions = getSuggestionsByKeywords(msg);
    setChat(prev => [
      ...prev,
      {
        type: "bot",
        text: [
          "Here's what my crystal ball sees:",
          "How about these?",
          "I cooked up these ideas just for you:",
          "😏 Ready for fun? Try one of these:",
          "Here’s something to spice up your weekend:",
          "Check these out! (You can also type 'surprise me')"
        ][Math.floor(Math.random() * 6)],
        suggestions,
      }
    ]);
    // Occasionally drop a fun fact
    if (Math.random() > 0.75) {
      setChat(prev => [
        ...prev,
        { type: "bot", text: getRandomFunFact() }
      ]);
    }
  }

  function handleAdd(act) {
    if (!selectedDays.length) return;
    addActivity(selectedDays[0], "morning", act);
    setChat(prev => [
      ...prev,
      { type: "bot", text: `✅ "${act.name}" added! ${getRandomFunnyReply()}` }
    ]);
    // 1/3 chance to offer another suggestion right away
    if (Math.random() > 0.66) {
      setChat(prev => [
        ...prev,
        { type: "bot", text: "Want another? Type a mood, activity, or just say 'surprise me'!" }
      ]);
    }
  }

  return (
    <div className="chatbot-widget">
      <div className="chatbot-header">💡 Smart Recommender</div>
      <div className="chatbot-body">
        {chat.map((msg, i) =>
          <div key={i} className={`chat-msg ${msg.type}`}>
            <div>
              {msg.text}
              {msg.suggestions && (
                <ul className="suggestion-list">
                  {msg.suggestions.map((act, idx) =>
                    <li key={idx}>
                      <span style={{marginRight:8}}>{act.emoji}</span>
                      <span>{act.name}</span>
                      <button className="add-suggestion-btn" onClick={() => handleAdd(act)}>
                        ➕ Add
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
        {typing && (
          <div className="chat-msg bot"><em>🤔 Typing...</em></div>
        )}
      </div>
      <form className="chatbot-input-bar" onSubmit={handleUserInput}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type anything! (Try: 'karaoke', 'food', 'surprise me'...)"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}