import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// TODO: get the BACKEND_URL.
const VITE_BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	// modify:
	const [user, setUser] = useState(null);

	useEffect(() => {
		// TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
		const saved = localStorage.getItem("token");
		if (!saved) return;

		const fetchUser = async () => {
			try {
				const res = await fetch(`${VITE_BACKEND_URL}/user/me`, {
					headers: {
						Authorization: `Bearer ${saved}`
					}
				});

				if (!res.ok) {
					localStorage.removeItem("token");
					setUser(null);
					navigate("/login");
					return;
				}
				const userData = await res.json();
				setUser(userData.user);
			} catch (err) {
				console.error("Failed to fetch user:", err);
				localStorage.removeItem("token");
				setUser(null);
			}
		};
		fetchUser();
	}, [navigate]);

	/*
	 * Logout the currently authenticated user.
	 *
	 */
	const logout = () => {
		// TODO:
		// Remove token from storage
		localStorage.removeItem("token");

		// Clear user state
		setUser(null);

		// Navigate away
		navigate("/");
	};

	/**
	 * Login a user with their credentials.
	 */
	const login = async (username, password) => {
		// TODO:
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ username, password })
			});

			const data = await res.json();

			if (!res.ok) {
			}

			localStorage.setItem("token", data.token);
			setUser({ username });
			navigate("/profile");
			return null;
		} catch (err) {
			return "Login request failed. Please try again.";
		}
	};

	/**
	 * Registers a new user.
	 */
	const register = async (userData) => {
		// TODO: complete me
		const { username, firstname, lastname, password } = userData;
		try {
			const res = await fetch(`${VITE_BACKEND_URL}/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ username, firstname, lastname, password })
			});
			const data = await res.json();

			if (!res.ok) {
				return data.message;
			}
			navigate("/success");
			return null;
		} catch (err) {
			return "register failed, please try again.";
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, register }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
