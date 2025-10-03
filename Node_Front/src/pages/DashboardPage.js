import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>대시보드</h1>
        <div className="user-info">
          <span>환영합니다, {user?.username}님!</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="user-card">
          <h2>사용자 정보</h2>
          <p><strong>사용자명:</strong> {user?.username}</p>
          <p><strong>이메일:</strong> {user?.email}</p>
          <p><strong>역할:</strong> {user?.role}</p>
          <p><strong>ID:</strong> {user?.id}</p>
        </div>
        
        <div className="dashboard-actions">
          <h2>기능</h2>
          <div className="action-buttons">
            <button className="action-button">프로필 수정</button>
            <button className="action-button">설정</button>
            {user?.role === 'admin' && (
              <button className="action-button">관리자 패널</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;