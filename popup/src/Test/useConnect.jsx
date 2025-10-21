import { useEffect, useRef } from 'react';
import { tabs$ } from '../streams';


function useConnect() {
  const portRef = useRef(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'bg-popup' });
    portRef.current = port;

    port.onMessage.addListener(msg => {
      if (msg.type === 'TABS_UPDATE') {
        tabs$(msg.tabs);
      }
    });

    return () => {
      port.disconnect();
      portRef.current = null;
    };
  }, []);

}
export default useConnect;