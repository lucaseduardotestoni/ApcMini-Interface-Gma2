import './Styles/ApcMiniGrid.css';
import ApcMiniGrid from './components/ApcMiniGrid';
import StatusPanel from './components/StatusPanel';

export default function App() {
  return (
    <div className="main-layout">
      <StatusPanel />
      <ApcMiniGrid />
    </div>
  );
}
