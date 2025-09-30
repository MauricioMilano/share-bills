import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Settlements from "./pages/Settlements";
import PayDebt from "./pages/PayDebt";
import Users from "./pages/Users";

function App() {
  return (
    <div>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/index" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/history/:groupId" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/groups/:groupId/settlements" element={<Settlements />} />
          <Route path="/groups/:groupId/pay" element={<PayDebt />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;