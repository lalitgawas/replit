/** Import necessary libraries */
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

/** Constants */
const SLUG_WORKS = ["car", "dog", "computer", "person", "inside", "word", "for", "please", "to", "cool", "open", "source"];
const SERVICE_URL = import.meta.env.VITE_INIT_SERVICE_URL || "http://localhost:3001";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at 50% -20%, #1e1b4b, var(--bg-color));
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: rgba(21, 24, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: white;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
`;

const inputStyles = `
  width: 100%;
  margin: 10px 0;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px;
  font-family: var(--font-sans);
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }
`;

const StyledInput = styled.input`
  ${inputStyles}
`;

const StyledSelect = styled.select`
  ${inputStyles}
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
`;

const StyledButton = styled.button`
  width: 100%;
  margin-top: 20px;
  padding: 14px 20px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

/** Helper function */
function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
  }
  return slug;
}

/** Component */
export const Landing = () => {
  const [language, setLanguage] = useState("nodejs");
  const [replId, setReplId] = useState(getRandomSlug());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <Container>
      <Card>
        <Title>Replit</Title>
        <StyledInput
          onChange={(e) => setReplId(e.target.value)}
          type="text"
          placeholder="Repl ID"
          value={replId}
        />
        <StyledSelect
          name="language"
          id="language"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="nodejs">Node.js</option>
          <option value="python">Python</option>
        </StyledSelect>
        <StyledButton disabled={loading} onClick={async () => {
          setLoading(true);
          await axios.post(`${SERVICE_URL}/project`, { replId, language });
          setLoading(false);
          navigate(`/coding?replId=${replId}`)
        }}>{loading ? "Starting ..." : "Start Coding"}</StyledButton>
      </Card>
    </Container>
  );
}