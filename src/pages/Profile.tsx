import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuVisibility, MENU_SECTIONS, MenuVisibilityConfig, AppRole } from "@/contexts/MenuVisibilityContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera, Loader2, Save, LayoutDashboard, ShieldCheck, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLE_TABS: { value: AppRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: "admin",  label: "Admin",  icon: ShieldCheck, description: "Administradores sempre veem todos os itens." },
  { value: "editor", label: "Editor", icon: Pencil,      description: "Configuração de visibilidade para editores." },
  { value: "viewer", label: "Viewer", icon: Eye,         description: "Configuração de visibilidade para visualizadores." },
];

export default function Profile() {
  const { user, profile, role } = useAuth();
  const { config, saveConfig } = useMenuVisibility();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local copy of menu config for editing (starts from persisted config)
  const [localConfig, setLocalConfig] = useState<MenuVisibilityConfig>(() => ({ ...config }));
  const [savingMenu, setSavingMenu] = useState(false);

  const initials = (fullName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro ao enviar imagem", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    setAvatarUrl("");
    await supabase.from("profiles").update({ avatar_url: filePath }).eq("id", user.id);

    const { data: signedData } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 3600);
    setAvatarUrl(signedData?.signedUrl ?? "");
    toast({ title: "Foto atualizada" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso" });
    }
    setSaving(false);
  };

  const toggleItem = (roleKey: AppRole, path: string, visible: boolean) => {
    setLocalConfig((prev) => ({
      ...prev,
      [roleKey]: visible
        ? prev[roleKey].filter((r) => r !== path)
        : [...prev[roleKey], path],
    }));
  };

  const handleSaveMenu = () => {
    setSavingMenu(true);
    saveConfig(localConfig);
    toast({ title: "Configurações de menu salvas" });
    setSavingMenu(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Profile Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Clique na foto para alterar</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* ── Menu Visibility Card (admin only) ── */}
      {role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Visibilidade do Menu por Perfil
            </CardTitle>
            <CardDescription>
              Escolha quais itens do menu cada perfil de usuário poderá visualizar.
              Administradores sempre têm acesso total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="mb-5 h-9">
                {ROLE_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger key={value} value={value} className="gap-1.5 text-xs px-3">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {ROLE_TABS.map(({ value: roleKey, description }) => (
                <TabsContent key={roleKey} value={roleKey} className="space-y-5 mt-0">
                  <p className="text-xs text-muted-foreground">{description}</p>

                  {roleKey === "admin" ? (
                    /* Admin: all checked, read-only */
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {MENU_SECTIONS.map((section) => (
                        <div key={section.label} className="space-y-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {section.label}
                          </p>
                          <div className="space-y-1.5">
                            {section.items.map((item) => (
                              <div key={item.path} className="flex items-center gap-2">
                                <Checkbox id={`admin-${item.path}`} checked disabled />
                                <label
                                  htmlFor={`admin-${item.path}`}
                                  className="text-sm text-muted-foreground cursor-not-allowed"
                                >
                                  {item.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Editor / Viewer: configurable */
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {MENU_SECTIONS.map((section) => (
                        <div key={section.label} className="space-y-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {section.label}
                          </p>
                          <div className="space-y-1.5">
                            {section.items.map((item) => {
                              const isVisible = !localConfig[roleKey].includes(item.path);
                              return (
                                <div key={item.path} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`${roleKey}-${item.path}`}
                                    checked={isVisible}
                                    onCheckedChange={(checked) =>
                                      toggleItem(roleKey, item.path, !!checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`${roleKey}-${item.path}`}
                                    className="text-sm cursor-pointer select-none"
                                  >
                                    {item.label}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <Button
              onClick={handleSaveMenu}
              disabled={savingMenu}
              className="w-full mt-2"
              variant="outline"
            >
              {savingMenu ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Configurações de Menu
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
