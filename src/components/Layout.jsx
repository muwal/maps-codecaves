import React from "react"
import Header from "./Header";
import { Container } from "reactstrap";

class Layout extends React.Component {
    render() {
        return (
            <>
                <main>
                    <section>
                        <Header />
                        <Container>{this.props.children}</Container>
                    </section>
                </main>
            </>
        )
    }
}
export default Layout;
