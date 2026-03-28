import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import FirebaseService from "../firebase/FirebaseService";

export default function Login({ onCreateAccount }) {
    const [isLogin, setIsLogin] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const savedName = await AsyncStorage.getItem('userName');
            const savedEmail = await AsyncStorage.getItem('userEmail');
            const savedPhone = await AsyncStorage.getItem('userPhone');

            if (savedName) setName(savedName);
            if (savedEmail) setEmail(savedEmail);
            if (savedPhone) setPhone(savedPhone);
        } catch (error) {
            console.log('Error loading user data:', error);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    const showAlert = (message, type = "error") => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    const handleAuth = async () => {
        // Email validation
        if (!validateEmail(email)) {
            showAlert("Please enter a valid email address", "error");
            return;
        }

        // Password validation
        if (password.length < 6) {
            showAlert("Password must be at least 6 characters", "error");
            return;
        }

        if (!isLogin) {
            // Name validation
            if (name.trim().length < 2) {
                showAlert("Please enter a valid name (at least 2 characters)", "error");
                return;
            }

            // Phone validation
            if (!validatePhone(phone)) {
                showAlert("Please enter a valid 10-digit phone number", "error");
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                await FirebaseService.signIn(email, password);
                showAlert("Logged in successfully!", "success");
            } else {
                await FirebaseService.signUp(email, password, name, phone);
                showAlert("Account created successfully!", "success");
            }

            // Navigate after small delay
            setTimeout(() => {
                setAlertVisible(false);
                if (onCreateAccount) {
                    onCreateAccount();
                }
            }, 1500);
        } catch (error) {
            let errorMessage = "Authentication failed";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already in use.";
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak.";
            }
            showAlert(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Decorative Background Elements */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="cart" size={50} color="#4CAF50" />
                </View>
                <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
                <Text style={styles.subtitle}>
                    {isLogin ? "Login to access your grocery lists" : "Join us and get your groceries delivered fast"}
                </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.formContainer}>
                {!isLogin && (
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                )}

                <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {!isLogin && (
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone (10 digits)"
                            placeholderTextColor="#999"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                )}

                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleAuth}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>{isLogin ? "Login" : "Create Account"}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer}>
                <Text style={styles.footerText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Text style={styles.link}>{isLogin ? "Sign Up" : "Login"}</Text>
                </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By {isLogin ? 'logging in' : 'creating an account'}, you agree to our{' '}
                    <Text style={styles.link}>Terms of Service</Text> and{' '}
                    <Text style={styles.link}>Privacy Policy</Text>
                </Text>
            </View>

            {/* Custom Alert Modal */}
            <Modal
                visible={alertVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAlertVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.alertBox,
                        alertType === "error" ? styles.errorAlert : styles.successAlert
                    ]}>
                        <View style={[
                            styles.alertIconContainer,
                            alertType === "error" ? styles.errorIconBg : styles.successIconBg
                        ]}>
                            <Ionicons
                                name={alertType === "error" ? "close-circle" : "checkmark-circle"}
                                size={50}
                                color="#fff"
                            />
                        </View>
                        <Text style={styles.alertTitle}>
                            {alertType === "error" ? "Oops!" : "Success!"}
                        </Text>
                        <Text style={styles.alertMessage}>{alertMessage}</Text>
                        <TouchableOpacity
                            style={[
                                styles.alertButton,
                                alertType === "error" ? styles.errorButton : styles.successButton
                            ]}
                            onPress={() => setAlertVisible(false)}
                        >
                            <Text style={styles.alertButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
    },
    backgroundCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        top: -100,
        right: -100,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        bottom: -50,
        left: -50,
    },
    header: {
        marginBottom: 40,
        alignItems: "center",
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#4CAF50",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#1a1a1a',
    },
    loginButton: {
        backgroundColor: "#4CAF50",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#4CAF50",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    footer: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
    link: {
        color: "#4CAF50",
        fontWeight: "600",
    },
    toggleContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    // Custom Alert Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    errorAlert: {
        borderTopWidth: 4,
        borderTopColor: '#ff4444',
    },
    successAlert: {
        borderTopWidth: 4,
        borderTopColor: '#4CAF50',
    },
    alertIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorIconBg: {
        backgroundColor: '#ff4444',
    },
    successIconBg: {
        backgroundColor: '#4CAF50',
    },
    alertTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 10,
        color: '#1a1a1a',
    },
    alertMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
        color: '#666',
    },
    alertButton: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12,
        minWidth: 120,
    },
    errorButton: {
        backgroundColor: '#ff4444',
    },
    successButton: {
        backgroundColor: '#4CAF50',
    },
    alertButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});