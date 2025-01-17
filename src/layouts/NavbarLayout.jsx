import { Box, Drawer } from '@mui/material'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom';
import DrawerList from '../components/NavBar/DrawerList';
import TopBar from '../components/NavBar/TopBar';

export default function NavbarLayout() {

    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

  return (
    <Box sx={{ padding: 0 }}>
        <header>
            <TopBar toggleDrawer={toggleDrawer} />
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <DrawerList toggleDrawer={toggleDrawer} />
            </Drawer>
        </header>
        <main>
            <Outlet />
        </main>
    </Box>
  )
}
