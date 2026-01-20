import * as ClipboardLib from 'expo-clipboard';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDB } from '../../../db/database';

interface TableInfo {
    name: string;
    schema: any[];
    data?: any[];
    expanded: boolean;
    rowCount: number;
    sqlDefinition?: string;
}

export default function DBInspector() {
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTab, setExpandedTab] = useState<'schema' | 'data' | 'sql'>('schema');

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

                // Obtener la definición SQL completa
                const sqlResult = await db.getAllAsync<{ sql: string }>(
                    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table.name}';`
                );

                return {
                    name: table.name,
                    schema,
                    data: [],
                    expanded: false,
                    rowCount: countResult[0]?.count || 0,
                    sqlDefinition: sqlResult[0]?.sql || '-- No se pudo obtener la definición SQL'
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

        if (!table.expanded) {
            // Solo cargar datos si se va a expandir
            const db = getDB();
            try {
                const data = await db.getAllAsync<any>(
                    `SELECT * FROM ${table.name} LIMIT 50;`
                );
                table.data = data;
            } catch (error) {
                console.error(`Error al obtener datos de ${table.name}:`, error);
            }
        }

        table.expanded = !table.expanded;
        setTables(updatedTables);
    };

    const copyToClipboard = async (text: string, tableName: string) => {
        try {
            await ClipboardLib.setStringAsync(text);
            Alert.alert('Copiado', `SQL de ${tableName} copiado al portapapeles`);
        } catch (error) {
            Alert.alert('Error', 'No se pudo copiar al portapapeles');
        }
    };

    const refreshData = async () => {
        setLoading(true);
        await fetchTablesInfo();
        setLoading(false);
    };

    const formatSQL = (sql: string): string => {
        // Formatear SQL para mejor legibilidad
        return sql
            .replace(/CREATE TABLE/g, '\nCREATE TABLE')
            .replace(/\(/g, '(\n  ')
            .replace(/\)/g, '\n)')
            .replace(/,/g, ',\n  ')
            .replace(/  \)/g, '\n)');
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
                <Text style={styles.title}>🛠️ Inspector de Base de Datos SQLite</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                    <Text style={styles.refreshText}>🔄 Actualizar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{tables.length}</Text>
                    <Text style={styles.statLabel}>Tablas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {tables.reduce((acc, table) => acc + table.rowCount, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Registros</Text>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, expandedTab === 'schema' && styles.activeTab]}
                    onPress={() => setExpandedTab('schema')}
                >
                    <Text style={[styles.tabText, expandedTab === 'schema' && styles.activeTabText]}>
                        📋 Esquema
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, expandedTab === 'sql' && styles.activeTab]}
                    onPress={() => setExpandedTab('sql')}
                >
                    <Text style={[styles.tabText, expandedTab === 'sql' && styles.activeTabText]}>
                        💾 SQL
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, expandedTab === 'data' && styles.activeTab]}
                    onPress={() => setExpandedTab('data')}
                >
                    <Text style={[styles.tabText, expandedTab === 'data' && styles.activeTabText]}>
                        📊 Datos
                    </Text>
                </TouchableOpacity>
            </View>

            {tables.map((table, index) => (
                <View key={table.name} style={styles.tableCard}>
                    <TouchableOpacity
                        style={styles.tableHeader}
                        onPress={() => toggleTable(index)}
                    >
                        <View style={styles.tableHeaderContent}>
                            <View style={styles.tableNameContainer}>
                                <Text style={styles.tableIcon}>📁</Text>
                                <View>
                                    <Text style={styles.tableName}>
                                        {table.expanded ? '▼' : '▶'} {table.name}
                                    </Text>
                                    <Text style={styles.tableInfo}>
                                        {table.schema.length} columnas • {table.rowCount} registros
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => copyToClipboard(table.sqlDefinition || '', table.name)}
                            >
                                <Text style={styles.copyButtonText}>📋 SQL</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {table.expanded && (
                        <View style={styles.tableContent}>
                            {expandedTab === 'schema' && (
                                <>
                                    <Text style={styles.sectionTitle}>Estructura de Columnas:</Text>
                                    <View style={styles.schemaHeader}>
                                        <Text style={styles.schemaHeaderCell}>Nombre</Text>
                                        <Text style={styles.schemaHeaderCell}>Tipo</Text>
                                        <Text style={styles.schemaHeaderCell}>Restricciones</Text>
                                    </View>
                                    {table.schema.map((column, colIndex) => (
                                        <View key={colIndex} style={styles.columnRow}>
                                            <Text style={styles.columnName}>
                                                {column.pk ? '🔑 ' : ''}{column.name}
                                            </Text>
                                            <Text style={styles.columnType}>{column.type}</Text>
                                            <Text style={styles.columnProps}>
                                                {column.pk ? 'PRIMARY KEY ' : ''}
                                                {column.notnull ? 'NOT NULL ' : ''}
                                                {column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </>
                            )}

                            {expandedTab === 'sql' && table.sqlDefinition && (
                                <>
                                    <View style={styles.sqlHeader}>
                                        <Text style={styles.sectionTitle}>Definición SQL:</Text>
                                        <TouchableOpacity
                                            style={styles.copyButtonSmall}
                                            onPress={() => copyToClipboard(table.sqlDefinition || '', table.name)}
                                        >
                                            <Text style={styles.copyButtonTextSmall}>Copiar</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.sqlContainer}>
                                        <ScrollView horizontal>
                                            <Text style={styles.sqlText}>
                                                {formatSQL(table.sqlDefinition)}
                                            </Text>
                                        </ScrollView>
                                    </View>
                                    <View style={styles.sqlFooter}>
                                        <Text style={styles.sqlInfo}>
                                            🗄️ Tabla: {table.name} | 📏 Columnas: {table.schema.length}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {expandedTab === 'data' && (
                                <>
                                    <Text style={styles.sectionTitle}>
                                        Datos (mostrando {Math.min(50, table.rowCount)} de {table.rowCount}):
                                    </Text>
                                    {table.data && table.data.length > 0 ? (
                                        <ScrollView horizontal style={styles.dataContainer}>
                                            <View>
                                                <View style={styles.dataHeader}>
                                                    {table.schema.map((column, idx) => (
                                                        <Text key={idx} style={styles.dataHeaderCell}>
                                                            {column.pk ? '🔑 ' : ''}{column.name}
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
                                        <View style={styles.noDataContainer}>
                                            <Text style={styles.noDataText}>📭 No hay datos registrados</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>
            ))}

            {/* Vista de todas las definiciones SQL juntas */}
            <View style={styles.allSQLContainer}>
                <Text style={styles.sectionTitle}>📜 Todas las Definiciones SQL</Text>
                <TouchableOpacity
                    style={styles.copyAllButton}
                    onPress={() => {
                        const allSQL = tables.map(t => t.sqlDefinition).join('\n\n');
                        copyToClipboard(allSQL, 'todas las tablas');
                    }}
                >
                    <Text style={styles.copyAllButtonText}>📋 Copiar Todo el SQL</Text>
                </TouchableOpacity>

                {tables.map((table, index) => (
                    <View key={index} style={styles.miniSQLCard}>
                        <Text style={styles.miniSQLTitle}>CREATE TABLE {table.name}</Text>
                        <Text style={styles.miniSQL} numberOfLines={2}>
                            {table.sqlDefinition?.substring(0, 100)}...
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    refreshButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    refreshText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#3b82f6',
        fontWeight: 'bold',
    },
    tableCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableHeader: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    tableHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tableNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tableIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    tableName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    tableInfo: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    copyButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#10b981',
        borderRadius: 6,
    },
    copyButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 12,
    },
    copyButtonSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#10b981',
        borderRadius: 4,
    },
    copyButtonTextSmall: {
        color: 'white',
        fontWeight: '500',
        fontSize: 10,
    },
    tableContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 12,
    },
    sqlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sqlContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    sqlText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#cbd5e1',
        lineHeight: 18,
    },
    sqlFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    sqlInfo: {
        fontSize: 11,
        color: '#64748b',
    },
    schemaHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 8,
        borderRadius: 6,
        marginBottom: 8,
    },
    schemaHeaderCell: {
        flex: 1,
        fontSize: 11,
        fontWeight: 'bold',
        color: '#475569',
    },
    columnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    columnName: {
        flex: 2,
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
    },
    columnType: {
        flex: 2,
        fontSize: 12,
        color: '#475569',
        fontFamily: 'monospace',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    columnProps: {
        flex: 3,
        fontSize: 11,
        color: '#64748b',
        fontStyle: 'italic',
    },
    dataContainer: {
        maxHeight: 400,
        marginBottom: 8,
    },
    dataHeader: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        padding: 10,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    dataHeaderCell: {
        minWidth: 120,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 11,
        paddingHorizontal: 8,
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 10,
        backgroundColor: 'white',
    },
    dataCell: {
        minWidth: 120,
        fontSize: 11,
        color: '#334155',
        paddingHorizontal: 8,
        fontFamily: 'monospace',
    },
    noDataContainer: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    noDataText: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    allSQLContainer: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    copyAllButton: {
        backgroundColor: '#8b5cf6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    copyAllButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    miniSQLCard: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#8b5cf6',
    },
    miniSQLTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    miniSQL: {
        fontSize: 10,
        color: '#64748b',
        fontFamily: 'monospace',
    },
});