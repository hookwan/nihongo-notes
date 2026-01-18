
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';

// --- Types ---
interface WordEntry {
  kanji: string;
  reading: string;
  meaning: string;
  tags?: string;
}

type Page = 'HOME' | 'PRACTICE' | 'SENSEI' | 'COLLECTION';

// --- Constants ---
const SHEET_ID = '1H-XP4biC77BiexlKCNGiyrlj_zlhWEpCyFUghieeRno';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// --- Components ---

const Header = ({ currentPage, setCurrentPage }: { currentPage: Page, setCurrentPage: (p: Page) => void }) => {
  const menuItems: Page[] = ['HOME', 'PRACTICE', 'SENSEI', 'COLLECTION'];
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem 1rem',
      borderBottom: '1px solid #ddd',
      backgroundColor: 'white'
    }}>
      {menuItems.map(item => (
        <button
          key={item}
          onClick={() => setCurrentPage(item)}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: currentPage === item ? '700' : '400',
            color: currentPage === item ? '#bc002d' : '#666',
            cursor: 'pointer',
            letterSpacing: '0.1rem',
            textTransform: 'uppercase',
            transition: 'color 0.2s'
          }}
        >
          {item}
        </button>
      ))}
    </nav>
  );
};

// Added 'key' to prop type definition to fix TypeScript error during JSX usage
const Flashcard = ({ word, onFlip }: { word: WordEntry, onFlip?: () => void, key?: React.Key }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  return (
    <div 
      onClick={handleFlip}
      style={{
        perspective: '1000px',
        width: '100%',
        maxWidth: '320px',
        height: '420px',
        cursor: 'pointer',
        margin: '0 auto'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#fffcf0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px solid #eee',
          padding: '2rem'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0', 
            width: '100%', 
            height: '40px', 
            backgroundColor: '#bc002d',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '1rem'
          }}>
            <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>NOTES / 言葉</span>
          </div>
          <h1 style={{ fontSize: '4rem', margin: '0', color: '#2d2d2d' }}>{word.kanji}</h1>
          <p style={{ color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>Click to flip</p>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: '#ffffff',
          color: '#2d2d2d',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '2px solid #bc002d',
          padding: '2rem'
        }}>
          <span style={{ fontSize: '1.2rem', color: '#bc002d', fontWeight: 'bold' }}>{word.reading}</span>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#eee', margin: '1.5rem 0' }}></div>
          <span style={{ fontSize: '1.5rem', textAlign: 'center' }}>{word.meaning}</span>
          {word.tags && <span style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>{word.tags}</span>}
        </div>
      </div>
    </div>
  );
};

const AISensei = () => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const askSensei = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Corrected: Initializing GoogleGenAI with the API key from environment variable directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are a Japanese Sensei. Explain grammar points, vocabulary, or culture concisely. Use a mix of English and Japanese. Be polite and encouraging."
        }
      });
      // response.text is a property, accessing it directly as required
      setChat(prev => [...prev, { role: 'model', text: response.text || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'model', text: "The Sensei is currently unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chat.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>Ask your Sensei about grammar or words.</p>
          )}
          {chat.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#bc002d' : '#f5f5f5',
              color: msg.role === 'user' ? 'white' : 'black',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              maxWidth: '80%'
            }}>
              {msg.text}
            </div>
          ))}
          {loading && <div style={{ alignSelf: 'flex-start', backgroundColor: '#f5f5f5', padding: '0.8rem 1rem', borderRadius: '12px', opacity: 0.6 }}>Sensei is thinking...</div>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askSensei()}
            placeholder="Type your question..."
            style={{ 
              flex: 1, 
              padding: '0.8rem', 
              borderRadius: '8px', 
              border: '1px solid #ddd', 
              outline: 'none' 
            }}
          />
          <button 
            onClick={askSensei}
            style={{ 
              padding: '0.8rem 1.5rem', 
              backgroundColor: '#bc002d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

const CollectionView = ({ words }: { words: WordEntry[] }) => (
  <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#bc002d', color: 'white' }}>
          <tr>
            <th style={{ padding: '1rem' }}>Word</th>
            <th style={{ padding: '1rem' }}>Reading</th>
            <th style={{ padding: '1rem' }}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {words.map((w, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{w.kanji}</td>
              <td style={{ padding: '1rem', color: '#bc002d' }}>{w.reading}</td>
              <td style={{ padding: '1rem' }}>{w.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PracticeView = ({ words }: { words: WordEntry[] }) => {
  const [index, setIndex] = useState(0);
  if (words.length === 0) return <div style={{ textAlign: 'center', padding: '4rem' }}>No words found.</div>;

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      {/* Passing key={index} to Flashcard resets its flipped state correctly when changing words */}
      <Flashcard word={words[index]} key={index} />
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          onClick={() => setIndex((i) => (i - 1 + words.length) % words.length)}
          style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #ccc', cursor: 'pointer', borderRadius: '4px' }}
        >
          Previous
        </button>
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#666' }}>
          {index + 1} / {words.length}
        </span>
        <button 
          onClick={() => setIndex((i) => (i + 1) % words.length)}
          style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #ccc', cursor: 'pointer', borderRadius: '4px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// --- App Root ---

const App = () => {
  const [page, setPage] = useState<Page>('HOME');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(CSV_URL);
        const text = await response.text();
        const rows = text.split('\n').slice(1); // Skip header
        const parsed = rows.map(row => {
          // Naive CSV parsing, assumes Word, Reading, Meaning
          const parts = row.split(',').map(p => p.trim());
          return {
            kanji: parts[0] || '',
            reading: parts[1] || '',
            meaning: parts[2] || '',
            tags: parts[3] || ''
          };
        }).filter(w => w.kanji);
        setWords(parsed);
      } catch (err) {
        console.error("Failed to fetch sheet data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const dailyWord = useMemo(() => {
    if (words.length === 0) return null;
    const today = new Date().getDate();
    return words[today % words.length];
  }, [words]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentPage={page} setCurrentPage={setPage} />
      
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '10rem', opacity: 0.5 }}>Loading your notes...</div>
        ) : (
          <>
            {page === 'HOME' && (
              <div style={{ textAlign: 'center', maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ 
                    fontSize: '0.8rem', 
                    letterSpacing: '0.2rem', 
                    color: '#bc002d', 
                    marginBottom: '1rem',
                    fontWeight: 800
                  }}>DAILY REMINDER / 今日の言葉</h2>
                  <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Keep consistency in your learning journey.</p>
                </div>
                {dailyWord && <Flashcard word={dailyWord} />}
                <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Total words tracked: <strong style={{ color: '#bc002d' }}>{words.length}</strong>
                  </p>
                </div>
              </div>
            )}

            {page === 'PRACTICE' && <PracticeView words={words} />}
            {page === 'SENSEI' && <AISensei />}
            {page === 'COLLECTION' && <CollectionView words={words} />}
          </>
        )}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        fontSize: '0.7rem', 
        color: '#aaa',
        letterSpacing: '0.1rem'
      }}>
        NIHOGO NOTES &copy; {new Date().getFullYear()} — BUILT WITH SENSEI AESTHETICS
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
