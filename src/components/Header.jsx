import React, { Component } from "react";
import { Container, Navbar, NavbarBrand } from "reactstrap";

class Header extends Component {
    render() {
        return (
            <React.Fragment>
                <Navbar color="light" light>
                    <NavbarBrand>Jejakin</NavbarBrand>
                </Navbar>
            </React.Fragment>
        );
    }
}

export default Header