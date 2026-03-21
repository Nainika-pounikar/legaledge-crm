import { createContext, useContext, useReducer, useState, useCallback } from 'react';
import { initialStore } from '../data/store';
import {
  permissions,
  modulePermissions,
  can as canAction,
  getPermissions,
  getModulePermissions,
  hasModuleAccess,
} from '../utils/permissions';
import { getStoredAuthUser } from '../utils/auth';

const CRMContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, [action.entity]: [...(state[action.entity]||[]), { ...action.payload, id: (state[action.entity]?.length || 0) + Date.now() % 10000 }] };
    case 'UPDATE':
      return { ...state, [action.entity]: state[action.entity].map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE':
      return { ...state, [action.entity]: state[action.entity].filter(i => i.id !== action.id) };
    default:
      return state;
  }
}

export function CRMProvider({ children }) {
  const [store, dispatch] = useReducer(reducer, initialStore);
  const [toast, setToast]   = useState(null);
  const [toastTimer, setToastTimer] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredAuthUser());
  const role = currentUser?.role;

  const showToast = useCallback((msg, type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer);
    setToast({ msg, type });
    const t = setTimeout(() => setToast(null), 3200);
    setToastTimer(t);
  }, [toastTimer]);

  const addRecord    = useCallback((entity, payload) => dispatch({ type:'ADD',    entity, payload }), []);
  const updateRecord = useCallback((entity, payload) => dispatch({ type:'UPDATE', entity, payload }), []);
  const deleteRecord = useCallback((entity, id)      => dispatch({ type:'DELETE', entity, id }),     []);
  const addActivity  = useCallback((payload) => {
    dispatch({
      type: 'ADD',
      entity: 'activities',
      payload: { ...payload, at: payload?.at || new Date().toISOString() },
    });
  }, []);
  const can = useCallback((action) => canAction(role, action), [role]);
  const currentPermissions = getPermissions(role);
  const canAccessModule = useCallback((module) => hasModuleAccess(role, module), [role]);
  const currentModulePermissions = getModulePermissions(role);

  return (
    <CRMContext.Provider value={{ store, addRecord, updateRecord, deleteRecord, addActivity, showToast, toast, currentUser, setCurrentUser, permissions, modulePermissions, currentPermissions, currentModulePermissions, can, canAccessModule }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => useContext(CRMContext);
