import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import AddEvent from "./pages/AddEvent";
import theme from "./theme";
import CurrentEvent from "./pages/CurrentEvent";
import { SocketProvider } from "./context/SocketContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventManagement from "./pages/EventManagement";
import OrganizerRoute from "./components/OrganizerRoute";
import CreateOrganizer from "./pages/CreateOrganizer";

const App = () => (
  <ChakraProvider theme={theme}>
    <CSSReset />
    <SocketProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<CurrentEvent />} />
        <Route path="/create-organizer" element={<CreateOrganizer />} />
        
        {/* Protected organizer routes */}
        <Route 
          path="/add" 
          element={
            <OrganizerRoute>
              <AddEvent />
            </OrganizerRoute>
          } 
        />
        <Route 
          path="/manage-events" 
          element={
            <OrganizerRoute>
              <EventManagement />
            </OrganizerRoute>
          } 
        />
      </Routes>
    </SocketProvider>
  </ChakraProvider>
);

export default App;
