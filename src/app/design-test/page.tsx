import React from "react";
import LayoutShell from "@/components/ui/LayoutShell";
import Button from "@/components/ui/Button";
import { H1, H2, Body, Caption, Label } from "@/components/ui/Typography";

export default function DesignTestPage() {
    return (
        <LayoutShell className="space-y-12">
            <div className="space-y-4">
                <Caption>Design System Verification</Caption>
                <H1>Focus Theme</H1>
                <Body>
                    This is a test of the &quot;Focus&quot; edition design system. It uses Slate-900 as the background
                    and Inter for typography.
                </Body>
            </div>

            <div className="space-y-6">
                <H2>Typography Scale</H2>
                <div className="space-y-2 border border-slate-700 p-4 rounded-xl">
                    <H1>Heading 1</H1>
                    <H2>Heading 2</H2>
                    <Body>Body text: The quick brown fox jumps over the lazy dog.</Body>
                    <Caption>Caption Text</Caption>
                    <Label>Label Text</Label>
                </div>
            </div>

            <div className="space-y-6">
                <H2>Buttons</H2>
                <div className="flex flex-col gap-4">
                    <Button variant="solid">Solid Action</Button>
                    <Button variant="outline">Outline Action</Button>
                    <Button variant="ghost">Ghost Action</Button>
                    <Button disabled>Disabled</Button>
                    <Button loading>Loading</Button>
                </div>
            </div>

            <div className="space-y-6">
                <H2>Colors</H2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background border border-slate-700 rounded-lg">
                        <Label>Background</Label>
                    </div>
                    <div className="p-4 bg-surface rounded-lg">
                        <Label>Surface</Label>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                        <Label className="text-white">Accent</Label>
                    </div>
                    <div className="p-4 bg-emerald-500 rounded-lg">
                        <Label className="text-white">Success</Label>
                    </div>
                </div>
            </div>
        </LayoutShell>
    );
}
