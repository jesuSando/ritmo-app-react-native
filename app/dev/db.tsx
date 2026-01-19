import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDB } from '../../db/database';

interface TableInfo {
    name: string;
    schema: any[];
    data?: any[];
    expanded: boolean;
    rowCount: number;
}

export default function DBInspector() {

    if (!__DEV__) {
        return null;
    }

    const [tables, setTables] = useState<TableInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTablesInfo();
    }, []);

    const fetchTablesInfo = async () => {
        try {
            const db = getDB();

            const tablesResult = await db.getAllAsync<{ name: string }>(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%';"
            );

            const basicInfoPromises = tablesResult.map(async (table) => {
                const schema = await db.getAllAsync<any>(
                    `PRAGMA table_info(${table.name});`
                );

                const countResult = await db.getAllAsync<{ count: number }>(
                    `SELECT COUNT(*) as count FROM ${table.name};`
                );

                return {
                    name: table.name,
                    schema,
                    data: [],
                    expanded: false,
                    rowCount: countResult[0]?.count || 0
                };
            });

            const tablesInfo = await Promise.all(basicInfoPromises);
            setTables(tablesInfo);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTable = async (index: number) => {
        const updatedTables = [...tables];
        const table = updatedTables[index];

        if (!table.expanded && table.data?.length === 0) {
            const db = getDB();
            try {
                const data = await db.getAllAsync<any>(
                    `SELECT * FROM ${table.name} LIMIT 20;`
                );
                table.data = data;
            } catch (error) {
                console.error(`Error al obtener datos de ${table.name}:`, error);
            }
        }

        table.expanded = !table.expanded;
        setTables(updatedTables);
    };

    const refreshData = async () => {
        setLoading(true);
        await fetchTablesInfo();
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Cargando base de datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📊 Inspector de Base de Datos</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                    <Text style={styles.refreshText}>🔄</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.summary}>
                Total de tablas: {tables.length}
            </Text>

            {tables.map((table, index) => (
                <View key={table.name} style={styles.tableCard}>
                    <TouchableOpacity
                        style={styles.tableHeader}
                        onPress={() => toggleTable(index)}
                    >
                        <View style={styles.tableHeaderContent}>
                            <Text style={styles.tableName}>
                                {table.expanded ? '▼' : '▶'} {table.name}
                            </Text>
                            <Text style={styles.rowCount}>
                                {table.rowCount} registro{table.rowCount !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {table.expanded && (
                        <View style={styles.tableContent}>
                            <Text style={styles.sectionTitle}>Columnas:</Text>
                            {table.schema.map((column, colIndex) => (
                                <View key={colIndex} style={styles.columnRow}>
                                    <Text style={styles.columnName}>{column.name}</Text>
                                    <Text style={styles.columnType}>{column.type}</Text>
                                    <Text style={styles.columnProps}>
                                        {column.pk ? 'PK ' : ''}
                                        {column.notnull ? 'NOT NULL ' : ''}
                                        {column.dflt_value ? `DEFAULT: ${column.dflt_value}` : ''}
                                    </Text>
                                </View>
                            ))}

                            <Text style={styles.sectionTitle}>
                                Datos (mostrando {Math.min(20, table.rowCount)} de {table.rowCount}):
                            </Text>

                            {table.data && table.data.length > 0 ? (
                                <ScrollView horizontal style={styles.dataContainer}>
                                    <View>
                                        {/* Encabezados de columnas */}
                                        <View style={styles.dataHeader}>
                                            {table.schema.map((column, idx) => (
                                                <Text key={idx} style={styles.dataHeaderCell}>
                                                    {column.name}
                                                </Text>
                                            ))}
                                        </View>

                                        {table.data.map((row, rowIndex) => (
                                            <View key={rowIndex} style={styles.dataRow}>
                                                {table.schema.map((column, colIndex) => (
                                                    <Text key={colIndex} style={styles.dataCell}>
                                                        {String(row[column.name] || 'NULL')}
                                                    </Text>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            ) : (
                                <Text style={styles.noDataText}>No hay datos registrados</Text>
                            )}
                        </View>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#7f8c8d',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    refreshButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#3498db',
        borderRadius: 4,
    },
    refreshText: {
        color: 'white',
        fontWeight: '600',
    },
    summary: {
        padding: 16,
        fontSize: 14,
        color: '#7f8c8d',
        backgroundColor: 'white',
        marginBottom: 8,
    },
    tableCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tableHeader: {
        padding: 16,
    },
    tableHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tableName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3498db',
    },
    rowCount: {
        fontSize: 14,
        color: '#95a5a6',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    tableContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
        marginTop: 12,
    },
    columnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    columnName: {
        flex: 2,
        fontSize: 12,
        fontWeight: '600',
        color: '#2d3436',
    },
    columnType: {
        flex: 2,
        fontSize: 12,
        color: '#636e72',
        fontFamily: 'monospace',
    },
    columnProps: {
        flex: 3,
        fontSize: 11,
        color: '#b2bec3',
    },
    dataContainer: {
        maxHeight: 300,
    },
    dataHeader: {
        flexDirection: 'row',
        backgroundColor: '#3498db',
        padding: 8,
    },
    dataHeaderCell: {
        flex: 1,
        minWidth: 100,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        paddingHorizontal: 4,
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        padding: 8,
    },
    dataCell: {
        flex: 1,
        minWidth: 100,
        fontSize: 11,
        color: '#2d3436',
        paddingHorizontal: 4,
        fontFamily: 'monospace',
    },
    noDataText: {
        fontSize: 12,
        color: '#b2bec3',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 16,
    },
});