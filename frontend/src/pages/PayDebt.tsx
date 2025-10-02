import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PayDebt() {
  const { groupId } = useParams<{ groupId: string }>();
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");


  // This page has been removed.
  export {};
