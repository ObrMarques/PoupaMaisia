import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currency, setCurrency] = useState(user?.currency || "BRL");
  const [language, setLanguage] = useState(user?.language || "pt-BR");

  const handleSaveProfile = () => {
    updateMutation.mutate(
      { data: { name, email, currency, language } },
      {
        onSuccess: (updatedUser) => {
          updateUser(updatedUser);
          toast({ title: "Profile updated successfully" });
        },
        onError: () => {
          toast({ title: "Error updating profile", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-medium shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name.charAt(0)
                )}
              </div>
              <Button variant="outline" className="bg-background">Change Avatar</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL (R$)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">PoupaMais is natively dark, but you can toggle.</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanent actions for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
