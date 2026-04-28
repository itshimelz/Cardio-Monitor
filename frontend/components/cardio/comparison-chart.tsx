"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ChartValue } from "@/lib/types"

type ComparisonChartProps = {
  data: ChartValue[]
}

const chartConfig = {
  normal: {
    label: "Normal",
    color: "var(--chart-2)",
  },
  user: {
    label: "Yours",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="metric" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="normal" fill="var(--color-normal)" radius={4} />
        <Bar dataKey="user" fill="var(--color-user)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
