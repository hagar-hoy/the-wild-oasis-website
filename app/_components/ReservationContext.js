"use client";
import { createContext, useContext, useState } from "react";

const ReservationContext = createContext();
function ReservationProvider({ children }) {
  const intialState = { from: undefined, to: undefined };
  const [range, setRange] = useState(intialState);
  const resetRange = () => setRange(intialState);
  return (
    <ReservationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined)
    throw new Error("context was used outside provider");
  return context;
}
export { useReservation, ReservationProvider };
