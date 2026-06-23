"use client"
import Image from "next/image"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const NewsletterSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  company: Yup.string().required("Company is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
})

export default function NewsletterForm() {
  return (
    <section className="max-w-[1320px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 items-center">

        {/* LEFT IMAGE */}
        <div>
          <div className="relative w-full h-[420px]">
  <Image
    src="/images/moldnews.png"
    alt="TOOLING
     Newsletter"
    fill
    className="object-contain"
    sizes="(max-width: 1024px) 100vw, 360px"
    priority
  />
</div>
        </div>

        {/* FORM */}
        <div>
          <h2 className="text-[32px] font-bold text-[#003B5C] mb-4">
            Subscribe to Tooling Newsletters
          </h2>

          <p className="text-gray-600 mb-8">
            Tooling Technology magazine is devoted to the Toolmaking industry.
            Find out the processes and strategies shops around the world use to
            become more effective and efficient.
          </p>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              company: "",
              email: "",
            }}
            validationSchema={NewsletterSchema}
            onSubmit={(values) => {
              console.log("Newsletter Submit", values)
            }}
          >
            {() => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <Field
                    name="firstName"
                    placeholder="First Name"
                    className="w-full border px-4 py-3"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="p"
                    className="text-red-600 text-xs mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="lastName"
                    placeholder="Last Name"
                    className="w-full border px-4 py-3"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="p"
                    className="text-red-600 text-xs mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="company"
                    placeholder="Company"
                    className="w-full border px-4 py-3"
                  />
                  <ErrorMessage
                    name="company"
                    component="p"
                    className="text-red-600 text-xs mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full border px-4 py-3"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-600 text-xs mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="bg-[#C8102E] text-white px-10 py-3 font-bold"
                  >
                    Submit
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  )
}
