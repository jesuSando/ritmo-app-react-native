import { Eye, EyeOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
    Pressable,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

type FieldType = 'text' | 'email' | 'password' | 'number';

interface FieldProps extends TextInputProps {
    label: string;
    type: FieldType;
    error?: string;
}

export default function Field({ label, type, error, value, onChangeText, onBlur, ...rest }: FieldProps) {
    const [focused, setFocused] = useState(false);
    const [show, setShow] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const isFloating = focused || Boolean(value);

    const inputProps: TextInputProps = (() => {
        switch (type) {
            case 'email':
                return {
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                };
            case 'number':
                return {
                    keyboardType: 'numeric',
                };
            default:
                return {};
        }
    })();

    return (
        <View style={{ marginTop: 24 }}>
            <Text
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    left: isFloating ? 0 : 12,
                    top: isFloating ? -18 : 14,
                    fontSize: isFloating ? 12 : 14,
                    color: error
                        ? '#e53935'
                        : focused
                            ? COLORS.primary
                            : '#555',
                }}
            >
                {label}
            </Text>

            <TextInput
                ref={inputRef}
                {...inputProps}
                {...rest}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={(event) => {
                    setFocused(false);
                    onBlur?.(event);
                }}
                secureTextEntry={type === 'password' && !show}
                style={{
                    borderRadius: 10,
                    padding: 12,
                    paddingRight: type === 'password' ? 40 : 12,
                    borderWidth: 1,
                    borderColor: error
                        ? '#e53935'
                        : focused
                            ? COLORS.primary
                            : '#ccc',
                }}
            />

            {type === 'password' && (
                <Pressable
                    onPress={() => {
                        setShow(prev => !prev);
                        requestAnimationFrame(() => {
                            inputRef.current?.focus();
                        });
                    }}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: [{ translateY: -10 }],
                        height: 20,
                    }}
                >

                    {show ? (
                        <EyeOff
                            width={20}
                            height={20}
                            color={
                                error
                                    ? '#e53935'
                                    : focused
                                        ? COLORS.primary
                                        : '#ccc'
                            }
                        />
                    ) : (
                        <Eye
                            width={20}
                            height={20}
                            color={
                                error
                                    ? '#e53935'
                                    : focused
                                        ? COLORS.primary
                                        : '#ccc'
                            }
                        />
                    )}
                </Pressable>
            )}

            {error && (
                <Text style={{ marginTop: 6, color: '#e53935', fontSize: 12 }}>
                    {error}
                </Text>
            )}
        </View>
    );
}