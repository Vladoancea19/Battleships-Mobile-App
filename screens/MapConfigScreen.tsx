import React, { useState } from 'react';
import {
    Switch,
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { sendMapConfiguration } from '../api';
import * as SecureStore from "expo-secure-store";


const shipImages: { [key: string]: any } = {
    '2': require('../util/resources/ship_2.png'),
    '3': require('../util/resources/ship_3.png'),
    '4': require('../util/resources/ship_4.png'),
    '6': require('../util/resources/ship_6.png'),
};

const MapConfigScreen: React.FC<{ route: any }> = ({ route }) => {
    const { gameId } = route.params;
    const [ships, setShips] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedShipSize, setSelectedShipSize] = useState('');
    const [vertical, setVertical] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('');

    const [shipCounts, setShipCounts] = useState<{ [key: string]: number }>({
        '2': 4,
        '3': 3,
        '4': 2,
        '6': 1,
    });

    const handleAddShip = (x: string, y: number, size: number, direction: string) => {
        const newShip: { x: string; y: number; size: number; direction: string } = {
            x,
            y,
            size,
            direction,
        };

        const shipPositions: { x: string; y: number }[] = [];
        if (direction === 'VERTICAL') {
            for (let i = 0; i < size; i++) {
                shipPositions.push({ x, y: y + i });
            }
        } else {
            for (let i = 0; i < size; i++) {
                shipPositions.push({ x: String.fromCharCode(x.charCodeAt(0) + i), y });
            }
        }

        const isColliding = shipPositions.some((position) => {
            return ships.some((ship) => {
                return ship.direction === 'VERTICAL'
                    ? ship.x === position.x && position.y >= ship.y && position.y < ship.y + ship.size
                    : ship.y === position.y && position.x.charCodeAt(0) >= ship.x.charCodeAt(0) && position.x.charCodeAt(0) < ship.x.charCodeAt(0) + ship.size;
            });
        });

        const isExceedingMap = shipPositions.some((position) => {
            return position.x < 'A' || position.x > 'J' || position.y < 1 || position.y > 10;
        });

        if (isColliding) {
            console.log('Ship collides with another ship');
        } else if (isExceedingMap) {
            console.log('Ship exceeds the map boundaries');
        } else {
            setShips([...ships, newShip]);
            setShowForm(false);
            updateShipCount(size.toString())
        }
    };

    const updateShipCount = (size: string) => {
        const updatedShipCounts = { ...shipCounts };
        updatedShipCounts[size] -= 1;
        if (updatedShipCounts[size] === 0) {
            const totalRemaining = Object.values(updatedShipCounts).reduce((acc, val) => acc + val, 0);
            if (totalRemaining === 0) {
                setShowSubmitButton(true);
            }
        }
        setShipCounts(updatedShipCounts);
    };

    const handleImagePress = (shipSize: string) => {
        setSelectedShipSize(shipSize);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (accessToken) {
                console.log(ships)
                await sendMapConfiguration(accessToken, gameId, ships);
                setWaitingMessage('Waiting for opponent to finish his strategy');
                setShowSubmitButton(false)
            }
        } catch (error) {
            console.error('Error submitting map configuration:', error);
        }
    };

    const [showSubmitButton, setShowSubmitButton] = useState(false);

    return (
        <ImageBackground source={require('../util/resources/background.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    Place your ships
                </Text>

                <View style={styles.gridContainer}>
                    <View style={styles.rowContainer}>
                        <View style={[styles.cell, styles.columnHeader]}></View>
                        {[...Array(10)].map((_, index) => (
                            <View key={index} style={[styles.cell, styles.columnHeader]}>
                                <Text style={styles.gridText}>{index + 1}</Text>
                            </View>
                        ))}
                    </View>
                    {[...Array(10)].map((_, rowIndex) => (
                        <View key={rowIndex} style={styles.rowContainer}>
                            <View style={[styles.cell, styles.rowHeader]}>
                                <Text style={styles.gridText}>{String.fromCharCode(65 + rowIndex)}</Text>
                            </View>
                            {[...Array(10)].map((_, colIndex) => {
                                const cellPosition = { x: String.fromCharCode(65 + rowIndex), y: colIndex + 1 };
                                const ship = ships.find((s) => {
                                    if (s.direction === 'VERTICAL') {
                                        return s.x === cellPosition.x && cellPosition.y >= s.y && cellPosition.y < s.y + s.size;
                                    } else {
                                        return s.y === cellPosition.y && cellPosition.x.charCodeAt(0) >= s.x.charCodeAt(0) && cellPosition.x.charCodeAt(0) < s.x.charCodeAt(0) + s.size;
                                    }
                                });

                                if (ship && ship.x === cellPosition.x && ship.y === cellPosition.y) {
                                    return (
                                        <View key={`${rowIndex}-${colIndex}`} style={[styles.cell, ship && ship.direction === 'VERTICAL' ? styles.verticalCell : null]}>
                                            <ShipImage
                                                size={ship.size}
                                                direction={ship.direction}
                                                cellSize={CELL_SIZE}
                                            />
                                        </View>
                                    );
                                } else {
                                    return (
                                        <View key={`${rowIndex}-${colIndex}`} style={styles.cell} />
                                    );
                                }
                            })}
                        </View>
                    ))}

                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.shipContainer}>
                        {Object.entries(shipCounts).map(([shipSize, remainingCount]) => (
                            <TouchableOpacity key={shipSize} style={styles.shipItem} onPress={remainingCount > 0 ? () => handleImagePress(shipSize) : undefined}>
                                <Image source={shipImages[shipSize]} style={styles.shipImage} resizeMode="contain" />
                                <Text style={styles.shipText}>{remainingCount}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                {showForm && (
                    <AddShipForm
                        shipSize={selectedShipSize}
                        vertical={vertical}
                        onAddShip={handleAddShip}
                        onToggleOrientation={() => setVertical(!vertical)}
                    />
                )}
                {showSubmitButton && (
                    <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                )}
                {waitingMessage ? (
                    <Text style={styles.title}>{waitingMessage}</Text>
                ) : null}
            </View>
        </ImageBackground>
    );
};

const AddShipForm: React.FC<{
    shipSize: string;
    vertical: boolean;
    onAddShip: (x: string, y: number, size: number, direction: string) => void;
    onToggleOrientation: () => void;
}> = ({ shipSize, vertical, onAddShip, onToggleOrientation }) => {
    const [x, setX] = useState('');
    const [y, setY] = useState('');

    const handleAddShip = () => {
        onAddShip(x, parseInt(y), parseInt(shipSize), vertical ? 'VERTICAL' : 'HORIZONTAL');
    };

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <Text style={styles.inputText}>X:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setX(text)}
                    value={x}
                    placeholder="A"
                />
                <Text style={styles.inputText}>Y:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setY(text)}
                    value={y}
                    keyboardType="numeric"
                    placeholder="1"
                />
            </View>
            <View style={styles.orientationContainer}>
                <Text style={styles.shipText}>{vertical ? 'Horizontal' : 'Vertical'}</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={vertical ? '#f4f3f4' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onToggleOrientation}
                    value={vertical}
                />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddShip}>
                <Text style={styles.buttonText}>Add Ship</Text>
            </TouchableOpacity>
        </View>
    );
};

const ShipImage: React.FC<{
    size: number;
    direction: string;
    cellSize: number;
}> = ({ size, direction, cellSize}) => {
    const shipImageWidth =  cellSize * size;

    let offset = 0

    if(size == 2) {
        offset = cellSize/2
    } else if(size == 3) {
        offset = cellSize
    } else if (size == 4) {
        offset = cellSize * 2 - 15
    } else {
        offset = cellSize * 3 - 17
    }

    const imageStyle = {
        width: shipImageWidth,
        height: 30,
        flex: 0,
        transform: [{ rotate: direction === 'HORIZONTAL' ? '90deg' : '0deg' }, {translateX: direction === 'HORIZONTAL' ? offset : 0}],
    };

    return (
        <Image
            source={shipImages[size]}
            style={imageStyle}
            resizeMode="stretch"
        />
    );
};

const CELL_SIZE = 30;

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        marginBottom: 20
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
    orientationContainer: {
      alignItems: "center",
        marginTop: 20
    },
    inputContainer: {
        flexDirection: "row"
    },
    gridContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    inputText: {
      fontSize: 30,
      marginEnd: 5,
      marginStart: 5
    },
    rowContainer: {
        flexDirection: 'row',
    },
    formContainer: {
        marginBottom: 40,
        flexDirection: "column"
    },
    addButton: {
        backgroundColor: 'black',
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
    },
    cell: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: "auto",
    },
    verticalCell: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'flex-start',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    columnHeader: {
        backgroundColor: '#f0f0f0',
    },
    rowHeader: {
        backgroundColor: '#f0f0f0',
    },
    gridText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    shipContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    shipItem: {
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: "column"
    },
    shipImage: {
        width: 100,
        height: 100,
        marginBottom: 5,
    },
    shipText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MapConfigScreen;
