import axios from 'axios';
import { ItineraryStop, TravelExpense, FuelCostResponse } from '../types';

const BASE_URL = typeof window !== 'undefined' && window.navigator.userAgent.includes('Android')
  ? 'http://10.0.2.2:8080/api/v1'
  : 'http://localhost:8080/api/v1';

export const tripApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStops = async (): Promise<ItineraryStop[]> => {
  const response = await tripApi.get('/trips/itinerary/stops');
  return response.data;
};

export const createStop = async (stop: Partial<ItineraryStop>): Promise<ItineraryStop> => {
  const response = await tripApi.post('/trips/itinerary/stops', stop);
  return response.data;
};

export const createExpense = async (expense: Partial<TravelExpense>): Promise<TravelExpense> => {
  const response = await tripApi.post('/trips/expenses', expense);
  return response.data;
};

export const getFuelEstimate = async (fuelPrice: number, consumption: number): Promise<FuelCostResponse> => {
  const response = await tripApi.get('/trips/fuel-calculator', {
    params: { fuelPrice, consumption }
  });
  return response.data;
};