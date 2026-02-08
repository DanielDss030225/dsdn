import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { db } from '../lib/firebase.js'
import { ref, get, set } from 'firebase/database'

export function LoginModal({ isOpen, onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        if (username.length !== 7 || isNaN(username)) {
            setError('O login deve ter exatamente 7 números.')
            return
        }
        if (password.length < 4) {
            setError('A senha deve ter pelo menos 4 caracteres.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const userRef = ref(db, `users/${username}`)
            const snapshot = await get(userRef)

            if (snapshot.exists()) {
                const userData = snapshot.val()
                if (userData.password === password) {
                    // Success
                    onLogin(username)
                } else {
                    setError('Senha incorreta.')
                }
            } else {
                // Create new user
                await set(userRef, {
                    password: password,
                    createdAt: new Date().toISOString()
                })
                onLogin(username)
            }
        } catch (err) {
            console.error(err)
            setError('Erro ao conectar ao servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent showClose={false}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Acesso ao Sistema</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Login (7 números)</Label>
                        <Input
                            id="username"
                            placeholder="Ex: 1234567"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={7}
                            disabled={loading}
                            className="text-lg tracking-widest text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="text-lg text-center"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}
                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                        {loading ? 'Conectando...' : 'Entrar / Criar Conta'}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground italic">
                        * Se o login for novo, ele será criado automaticamente com a senha digitada.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    )
}
