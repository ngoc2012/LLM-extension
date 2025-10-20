// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import { pushLog } from './pushLog';
import { prompt$, selectedTabId$ } from './streams';
import { navigateToUrl, actions} from './content';

function ActionTest() {

  return (
    <div>
      <h3>Action Test</h3>
      <button onClick={() => navigateToUrl('https://www.vnexpress.net', selectedTabId$())}>
        Navigate
      </button>
    </div>
  );
}

export default ActionTest;
