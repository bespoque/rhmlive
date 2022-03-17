import Widget from "../widget";
import Link from 'next/link';
import { shallowEqual, useSelector } from 'react-redux';
import jwt from "jsonwebtoken";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import setAuthToken from "../../functions/setAuthToken";
import { ToastContainer } from "react-toastify";
import Loader from "react-loader-spinner";
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";
import url from "../../config/url";

const fields = [
  {
    name: "Name",
    key: "name",
  },
  {
    name: "Email",
    key: "email",
  },
  {
    name: "Station",
    key: "station",
  },
  {
    name: "Phone",
    key: "phone",
  },
  {
    name: "Active",
    key: "active",
  },
  {
    name: "Created at",
    key: "createdAt",
  },
];

export const ViewUsersTable = ({ remittance }) => {
  let items = remittance;
  console.log("Items", items);
  return (
    <>
      <Widget>
        <table className="table divide-y">
          <thead>
            <tr className="">
              {fields.map((field, i) => (
                <th key={i} className="">
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((remittance, i) => (
              <tr key={i} className="">
                {fields.map((field, j) => (
                  <td key={j} className="">
                    {/* {remittance[field.key]} */}

                    <Link href={`/view/users/${remittance.email}`}>
                      <a className="hover:text-blue-500">
                        {remittance[field.key]}
                      </a>
                    </Link>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      </Widget>
    </>
  );
};


export default function UpdateUser() {
  const [taxStation, setTaxStation] = useState([])
  const [uploadErrors, setUploadErrors] = useState(() => []);
  const [department, setDepartment] = useState([])
  const [rhmGroups, setRhmGroups] = useState([])
  const [isFetching, setIsFetching] = useState(() => false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const { config, palettes, auth } = useSelector(
    (state) => ({
      config: state.config,
      palettes: state.palettes,
      auth: state.authentication.auth,
    }),
    shallowEqual
  );

  const Approval = [2, 3, 12, 1]
  const decoded = jwt.decode(auth);
  const creator = decoded.user

  useEffect(() => {

    setAuthToken();
    const fetchPost = async () => {
      try {
        let res = await axios.get(`${url.BASE_URL}user/items`);
        let itemsBody = res.data.body
        let taxOffice = itemsBody.taxOffice
        let depart = itemsBody.department
        let rhmGroups = itemsBody.rhmGroups
        setTaxStation(taxOffice)
        setDepartment(depart)
        setRhmGroups(rhmGroups)

      } catch (e) {
        // setIsFetching(false);
      }
    };
    fetchPost();

  }, []);

  const options = rhmGroups.map(item => {
    return {
      label: item.role,
      value: item.id
    }
  })

  setAuthToken();
  const onSubmit = (data) => {
    setIsFetching(true)
    axios.post(`${url.BASE_URL}user/signup`, data)
      .then(function (response) {
        setIsFetching(false)
        toast.success("Created Successfully!");
        router.push("/dashboard")
      })
      .catch(function (error) {
        setIsFetching(false)
        if (error.response) {
          setUploadErrors(() => error.response.data.message);
          toast.error(uploadErrors)
        } else {
          toast.error("Failed to create user!");
        }
      })
  };


  return (

    <div>

      <ToastContainer />

      <div className="block p-6 rounded-lg bg-white w-full">
        <div className="flex justify-center mb-4">
          <h6 className="p-2">Update User</h6>
        </div>
        {isFetching && (
          <div className="flex justify-center item mb-2">
            <Loader
              visible={isFetching}
              type="BallTriangle"
              color="#00FA9A"
              height={19}
              width={19}
              timeout={0}
              className="ml-2"
            />
            <p className="font-bold">Processing...</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group ">
              <p>Full name</p>
              <input type="text" name="name" className="form-control mb-4 w-full rounded font-light text-gray-500"
                placeholder="Enter Full name" ref={register({ required: "Name is required" })}
              />
              {errors.name && <p className="text-red-600">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <p>Password</p>
              <input name="password" type="text" className="form-control mb-4 w-full rounded font-light text-gray-500"
                ref={register({ required: "Password is required", minLength: { value: 8, message: "password must be at least 8 charachers in length" } })}
              />
              {errors.password && <p className="text-red-600">{errors.password.message}</p>}
            </div>

            <div className="form-group ">
              <p>Department</p>
              <select name="dept" ref={register({ valueAsNumber: true })} className="form-control SlectBox mb-4 w-full rounded font-light text-gray-500">
                {department.map((dept) => <option key={dept.id} defaultValue={dept.id}>{dept.name}</option>)}
              </select>
            </div>

            <div className="form-group ">
              <p>Tax Station</p>
              <select ref={register()} name="station" class="form-control mb-4 SlectBox w-full rounded font-light text-gray-500" id="taxStation">
                {taxStation.map((office) => <option key={office.idstation} defaultValue={office.station_code}>{office.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <p>User group</p>

              <Controller
                control={control}
                defaultValue={options.map(c => c.value).toString()}
                name="userGroup"
                rules={{ required: "please select user group" }}
                render={({ onChange, value, ref }) => (
                  <MultiSelect

                    inputRef={ref}
                    options={options}
                    value={((options.filter(c => value.includes(c.value))))}
                    onChange={val => onChange(val.map(c => c.value).toString())}
                    labelledBy="Select group"
                  />
                )}
              />
              {errors.userGroup && <p className="text-red-600">{errors.userGroup.message}</p>}
            </div>

            <div className="form-group ">
              <p>Email</p>
              <input name="email" ref={register({ required: "Email is required" })} type="email" className="form-control mb-4 w-full rounded font-light text-gray-500"
              />
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>
            <div className="form-group ">
              <p>Phone Number</p>
              <input name="phone" ref={register()} type="text" className="form-control mb-4 w-full rounded font-light text-gray-500"
              />
            </div>

            <div className="form-group ">
              <p>Active</p>

              <select ref={register()} name="active" class="form-control mb-4 SlectBox  w-full rounded font-light text-gray-500">
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            <div className="form-group hidden">
              <p>Created By</p>
              <input name="createdBy" value={creator} ref={register({ required: "Created by is required" })} type="text" className="form-control mb-4 w-full rounded font-light text-gray-500"
              />
              {errors.createdBy && <p className="text-red-600">{errors.createdBy.message}</p>}
            </div>
          </div>
          <div className="mb-6 flex justify-center">
            <button
              style={{ backgroundColor: "#84abeb" }}
              className="btn btn-default text-white btn-outlined bg-transparent rounded-md"
              type="submit"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}