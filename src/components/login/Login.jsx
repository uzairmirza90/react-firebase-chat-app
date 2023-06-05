import React, {useEffect, useState} from "react";
import {Container, Box, Typography, TextField, Button} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import {auth, db} from "../../firebase/config";
import CircularProgress from "@mui/material/CircularProgress";
import {useNavigate} from "react-router-dom";
import {signInWithEmailAndPassword} from "firebase/auth";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Alert from "@mui/material/Alert";

const Login = ({loading, setLoading}) => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginFormErrors, setLoginFormErrors] = useState({
    emailError: "",
    passwordError: "",
  });
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const user = localStorage.getItem("chat-app-user");
    if (user) {
      navigate("/chats");
      console.log("ha");
    }
  }, []);

  const handleLogin = async () => {
    let emailError = "";
    let passwordError = "";

    if (loginForm.email === "") {
      emailError = "Please enter an email.";
    }

    if (loginForm.password === "") {
      passwordError = "Please enter a password.";
    }

    setLoginFormErrors({emailError, passwordError});

    if (loginForm.email !== "" && loginForm.password !== "") {
      setLoading(true);
      setFirebaseError("");
      try {
        await signInWithEmailAndPassword(
          auth,
          loginForm.email,
          loginForm.password
        )
          .then((data) => {
            console.log(data.user);
            setLoading(false);
            toast("Success!");
            localStorage.setItem(
              "chat-app-user",
              JSON.stringify({
                email: data.user.email,
                uid: data.user.uid,
              })
            );
            navigate("/chats");
          })
          .catch((error) => {
            console.log("Error: ", error);
            setLoading(false);
            setFirebaseError(error.code);
          });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingLeft={8}
        paddingRight={8}
        height={60}
        width={"100%"}
        backgroundColor={"gray"}
      >
        <Typography variant="h4" color={"white"} fontWeight={600}>
          Chat App
        </Typography>
      </Box>
      <Container
        maxWidth="sm"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "6%",
          border: "2px solid lightgrey",
          borderRadius: 10,
          paddingTop: 20,
          paddingBottom: 20,
          width: 450,
        }}
      >
        <Typography variant="h4">Login</Typography>
        {firebaseError && <Alert severity="error">{firebaseError}</Alert>}
        <TextField
          error={false}
          id="outlined-error"
          label="Email"
          fullWidth
          value={loginForm.email}
          onChange={(e) => {
            setLoginForm({...loginForm, email: e.target.value});
            if (e.target.value.length > 0) {
              setLoginFormErrors({...loginFormErrors, emailError: ""});
            }
          }}
        />
        {loginFormErrors.emailError !== "" && (
          <Typography
            color={"red"}
            variant="p"
            style={{alignSelf: "flex-start"}}
          >
            {loginFormErrors.emailError}
          </Typography>
        )}
        <FormControl fullWidth>
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            fullWidth
            value={loginForm.password}
            onChange={(e) => {
              setLoginForm({...loginForm, password: e.target.value});
              if (e.target.value.length > 0) {
                setLoginFormErrors({...loginFormErrors, passwordError: ""});
              }
            }}
          />
        </FormControl>
        {loginFormErrors.passwordError !== "" && (
          <Typography
            color={"red"}
            variant="p"
            style={{alignSelf: "flex-start"}}
          >
            {loginFormErrors.passwordError}
          </Typography>
        )}
        <Box display={"flex"} flexDirection={"row"} gap={2}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Button
                variant="contained"
                onClick={(e) => {
                  handleLogin();
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/register");
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
        <ToastContainer />
      </Container>
    </>
  );
};

export default Login;
