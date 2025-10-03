import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Express MongoDB React App</h1>
        <p>Node.js, Express, MongoDB, React를 사용한 풀스택 애플리케이션</p>
      </header>
      
      <main className="home-content">
        {!isAuthenticated ? (
          <div className="auth-section">
            <h2>시작하기</h2>
            <p>계정이 필요합니다. 로그인하거나 새 계정을 만드세요.</p>
            <div className="auth-buttons">
              <button 
                className="auth-button login"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
              <button 
                className="auth-button register"
                onClick={() => navigate('/register')}
              >
                회원가입
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-section">
            <h2>환영합니다!</h2>
            <p>대시보드에서 더 많은 기능을 확인하세요.</p>
            <button 
              className="dashboard-button"
              onClick={() => navigate('/dashboard')}
            >
              대시보드로 이동
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;