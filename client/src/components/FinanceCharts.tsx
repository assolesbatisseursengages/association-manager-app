import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ExpenseData {
  category: string;
  amount: number;
}

interface MonthlyData {
  month: string;
  revenues: number;
  expenses: number;
}

interface BalanceData {
  month: string;
  balance: number;
}

interface FinanceChartsProps {
  expensesByCategory: ExpenseData[];
  monthlyData: MonthlyData[];
  balanceHistory: BalanceData[];
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function FinanceCharts({
  expensesByCategory,
  monthlyData,
  balanceHistory,
}: FinanceChartsProps) {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Pie Chart - Dépenses par Catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition des Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, amount }) => `${category}: ${amount}F`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {expensesByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}F`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Revenus vs Dépenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenus vs Dépenses Mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}F`} />
              <Legend />
              <Bar dataKey="revenues" fill="#10b981" name="Revenus" />
              <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart - Évolution du Solde */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Évolution du Solde</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}F`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Solde"
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
