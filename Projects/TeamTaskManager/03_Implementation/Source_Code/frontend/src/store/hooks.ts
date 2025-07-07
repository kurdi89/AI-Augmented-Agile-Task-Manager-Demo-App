// Team Task Manager - Redux Typed Hooks
// Sprint 1: Type-safe Redux hooks
// Created: July 6, 2025

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector); 