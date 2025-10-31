"use client"
import { createContext, useContext, useState, ReactNode } from "react";

type LocationContextType = {
  locations: string[];
  addLocation: (loc: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<string[]>([]);

  const addLocation = (loc: string) => {
    setLocations(prev => [...prev, loc]);
  }

  return (
    <LocationContext.Provider value={{ locations, addLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
}
