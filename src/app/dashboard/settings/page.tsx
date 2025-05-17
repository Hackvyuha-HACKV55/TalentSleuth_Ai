
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { UserCircle, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Profile Settings */}
        <Card className="rounded-lg shadow-lg bg-card border">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-primary flex items-center"><UserCircle className="mr-2 h-5 w-5" /> Profile Settings</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Current User Name" className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="user@example.com" disabled className="rounded-lg" />
              </div>
            </div>
            <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">Save Profile Changes</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Notification Settings */}
        <Card className="rounded-lg shadow-lg bg-card border">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-primary flex items-center"><Bell className="mr-2 h-5 w-5" /> Notification Settings</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
              <Label htmlFor="emailNotifications" className="font-normal">
                Email Notifications for New Matches
              </Label>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
              <Label htmlFor="appNotifications" className="font-normal">
                In-App Notifications for Red Flags
              </Label>
              <Switch id="appNotifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Appearance Settings - Basic Placeholder */}
        <Card className="rounded-lg shadow-lg bg-card border">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-primary flex items-center"><Palette className="mr-2 h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
             <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
              <Label htmlFor="darkMode" className="font-normal">
                Dark Mode
              </Label>
              {/* Basic switch, full dark mode theme toggle would need more logic */}
              <Switch id="darkMode" />
            </div>
            <p className="text-sm text-muted-foreground">More appearance settings coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
