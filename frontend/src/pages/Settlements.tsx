const apiUrl = import.meta.env.VITE_API_URL || "";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function Settlements() {
  const { groupId } = useParams<{ groupId: string }>();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const token = localStorage.getItem("token");


  // This page has been removed.
  export {};
